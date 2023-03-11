import { Column, ModelObjects, Tables } from "common";
import { ModelPartProvider, NamesRegistry } from "re";

import { DefinitionsRegistry } from "./DefinitionsRegistry";
import { DiagramVisualization } from "./DiagramVisualization";
import { JSONSchemaTableControlTypes } from "../JSONSchemaTableControlTypes";
import { JSONTableObjectTypes } from "../JSONTableObjectTypes";
import { ModelProvider } from "./ModelProvider";
import { PropertyTypeProvider } from "./PropertyTypeProvider";
import { RefProvider } from "./RefProvider";
import { SchemaProvider } from "./SchemaProvider";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";

export class JSONSchemaModelObjectsProvider
  implements ModelPartProvider<ModelObjects>
{
  public constructor(
    private _namesRegistry: NamesRegistry,
    private _definitionsRegistry: DefinitionsRegistry,
    private schema: any,
    private propertyTypeProvider: PropertyTypeProvider,
    private diagramVisualization: DiagramVisualization,
    private refProvider: RefProvider,
    private modelProvider: ModelProvider,
    private schemaProvider: SchemaProvider
  ) {}

  private getModelCaption(): string {
    return this.schemaProvider.isOpenAPI() ? "OpenAPI" : "JSON Schema";
  }

  public async provide(): Promise<ModelObjects> {
    this._definitionsRegistry.setBaseURI(this.schema.$id);

    const rootId = uuidv4();
    if (this.schema === true || this.schema === false) {
      const booleanSchema = {
        ...this.modelProvider.createTableStub(),
        id: rootId,
        cols: [],
        embeddable: false,
        name: this.getModelCaption(),
        objectType:
          this.schema === true
            ? JSONTableObjectTypes.TRUE
            : JSONTableObjectTypes.FALSE,
        nodeType: JSONSchemaTableControlTypes.ROOT,
        visible: true
      };
      this._namesRegistry.registerTable(booleanSchema);
    } else {
      this.createDatatypeTable(
        rootId,
        this.schema,
        true,
        this.propertyTypeProvider.getPropertyType(
          this.schema,
          "",
          false,
          true,
          []
        ),
        [],
        true,
        undefined,
        true,
        undefined,
        []
      );
    }

    const tables = this._namesRegistry.tablesOfIds;

    return {
      relations: {},
      tables: tables.reduce(
        (r, i) => {
          r[i.id] = i;
          return r;
        },
        { [rootId]: this._namesRegistry.tableById(rootId) } as Tables
      ),
      otherObjects: {},
      order: []
    };
  }

  private formatJSON(json: any) {
    return _.isEmpty(json) ? `` : JSON.stringify(json, null, "  ");
  }

  private buildPath(path: string[], propertyName: string, id: string) {
    return [...path, propertyName];
  }

  private createDefs(
    defsPropertyName: string,
    defOwner: any,
    schemaRootTableId: string,
    isRoot: boolean,
    shouldAddDefs: boolean,
    path: string[]
  ) {
    const defs = defOwner[defsPropertyName];
    const availableDefs = _.map(
      _.filter(_.keys(defs), (key) => {
        return true; //typeof defs[key] === "object";
      }),
      (key) => ({
        tableId: uuidv4(),
        propertyName: key,
        id: defs[key].$id,
        defsPropertyName
      })
    );

    _.forEach(availableDefs, ({ tableId, propertyName, id }) => {
      this._definitionsRegistry.addDef(
        propertyName,
        this._definitionsRegistry.buildAbsoluteURI(id),
        tableId,
        schemaRootTableId
      );
    });

    if (isRoot) {
      _.forEach(availableDefs, ({ propertyName, tableId }) => {
        this.createDatatypeTable(
          tableId,
          defs[propertyName],
          false,
          defs[propertyName].type,
          [],
          shouldAddDefs && this.isDefsProperty(propertyName),
          schemaRootTableId,
          true,
          tableId,
          this.buildPath(path, propertyName, "1")
        );
        const table = this._namesRegistry.tableById(tableId);
        if (table) {
          table.visible = true;
          table.name = propertyName;
        }
      });
    }

    return availableDefs;
  }

  private isDefsProperty(propertyName: string) {
    return propertyName === "$defs" || propertyName === "definitions";
  }

  private createDatatypeTable(
    tableId: string,
    property: any,
    isRoot: boolean,
    type: string,
    required: string[],
    shouldAddDefs: boolean,
    schemaRootTableId: string,
    shouldHoldSpecification: boolean,
    parentTableId: string,
    path: string[]
  ): string {
    if (isRoot) {
      this.schemaProvider.loadSchema(property);
    }
    if (parentTableId) {
      this._definitionsRegistry.addRef(tableId, parentTableId);
    }
    let subSchemaRootTableId = schemaRootTableId || tableId;

    if (property === true || property === false) {
      const result = {
        ...this.modelProvider.createTableStub(),
        id: tableId,
        cols: [],
        embeddable: !isRoot,
        name: isRoot ? "schema" : property === true ? "true" : "false",
        objectType:
          property === true
            ? JSONTableObjectTypes.TRUE
            : JSONTableObjectTypes.FALSE,
        visible: isRoot || this._definitionsRegistry.isDef(tableId),
        nodeType: isRoot
          ? JSONSchemaTableControlTypes.ROOT
          : this._definitionsRegistry.isDef(tableId)
          ? JSONSchemaTableControlTypes.SUBSCHEMA
          : JSONSchemaTableControlTypes.STANDARD
      };
      this._namesRegistry.registerTable(result);
      return result.id;
    }

    if (typeof property !== "object") {
      return undefined;
    }

    const propertyNames = _.filter(_.keys(property), (propertyName) =>
      this.diagramVisualization.isVisualizedOnDiagram(
        type,
        propertyName,
        property,
        isRoot
      )
    );

    const currentRequired =
      !!property &&
      Array.isArray(property.required) &&
      _.every(property.required, _.isString)
        ? property.required
        : [
            JSONTableObjectTypes.ALLOF.toString(),
            JSONTableObjectTypes.ANYOF.toString(),
            JSONTableObjectTypes.ONEOF.toString(),
            JSONTableObjectTypes.NOT.toString()
          ].includes(type)
        ? undefined
        : required;
    const nextRequired = currentRequired;
    let idPropertyList: IdProperty[] = [];
    if (!!property && shouldAddDefs) {
      if (isRoot) {
        this._definitionsRegistry.addDef(
          property.$dynamicAnchor,
          property.$id,
          tableId,
          tableId
        );
      }
      if (
        property.$defs &&
        type !== JSONTableObjectTypes.KEYOBJECT &&
        !this.schemaProvider.isOpenAPI()
      ) {
        idPropertyList = this.createDefs(
          "$defs",
          property,
          schemaRootTableId || tableId,
          isRoot,
          shouldAddDefs,
          this.buildPath(path, "$defs", "2")
        );
        subSchemaRootTableId = tableId;
      }
      if (
        property.definitions &&
        type !== JSONTableObjectTypes.KEYOBJECT &&
        !this.schemaProvider.isOpenAPI()
      ) {
        idPropertyList = this.createDefs(
          "definitions",
          property,
          schemaRootTableId || tableId,
          isRoot,
          shouldAddDefs,
          this.buildPath(path, "definitions", "3")
        );
        subSchemaRootTableId = tableId;
      }
    }

    const cols = _.reduce(
      propertyNames,
      (r, propertyName) => {
        const columnRequired = nextRequired;
        const col = this.createPropertyCol(
          undefined,
          property[propertyName],
          propertyName,
          columnRequired,
          this.propertyTypeProvider.getPropertyType(
            property[propertyName],
            propertyName,
            Array.isArray(property),
            false,
            path
          ),
          Array.isArray(property),
          subSchemaRootTableId,
          false,
          shouldAddDefs,
          tableId,
          this.buildPath(path, propertyName, "4")
        );
        if (col) {
          return [...r, col];
        }
        return r;
      },
      []
    );

    const specification = this.createPropertyColSpecification(
      property,
      type,
      isRoot,
      shouldAddDefs,
      {},
      shouldHoldSpecification,
      path
    );

    const titleObj = isRoot && property.title ? { name: property.title } : {};
    const descObj =
      this._definitionsRegistry.isDef(tableId) &&
      property?.description &&
      _.isString(property.description)
        ? { desc: this.escapeDescriptionString(property.description) }
        : {};
    const schemaObj = this.convertSchema(property, isRoot);

    let objectType = Array.isArray(type) ? JSONTableObjectTypes.MULTI : type;
    if (!type && this.refProvider.isRef(property)) {
      const { id } = this.refProvider.getOrCreateRef(
        schemaRootTableId,
        property,
        parentTableId
      );
      if (id) {
        objectType = id;
      }
    }

    const nodeType = isRoot
      ? JSONSchemaTableControlTypes.ROOT
      : this._definitionsRegistry.isDef(tableId)
      ? JSONSchemaTableControlTypes.SUBSCHEMA
      : JSONSchemaTableControlTypes.STANDARD;

    const result = {
      ...this.modelProvider.createTableStub(),
      id: tableId,
      cols,
      embeddable: !isRoot,
      name: isRoot
        ? this.getModelCaption()
        : Array.isArray(type)
        ? type.join(",")
        : _.isString(type)
        ? type
        : ``,
      objectType,
      visible: isRoot || this._definitionsRegistry.isDef(tableId),
      nodeType,
      specification,
      ...titleObj,
      ...descObj,
      ...schemaObj
    };
    this._namesRegistry.registerTable(result);
    return result.id;
  }

  private createPropertyColSpecificationEnum(enumValues: any): any {
    return { enum: enumValues };
  }

  private convertSchema(property: any, isRoot: boolean) {
    if (isRoot) {
      if (property?.$schema && _.isString(property.$schema)) {
        return { schema: property.$schema };
      }
      if (property?.openapi && _.isString(property.openapi)) {
        return { schema: property?.openapi };
      }
      if (property?.swagger && _.isString(property.swagger)) {
        return { schema: property?.swagger };
      }
    }
    return {};
  }

  private createPropertyColSpecification(
    property: any,
    type: any,
    isRoot: boolean,
    isDef: boolean,
    ref: any,
    shouldHoldSpecification: boolean,
    path: string[]
  ): string {
    if (!shouldHoldSpecification) {
      return "{}";
    }
    let result = { ...ref };
    if (Array.isArray(type)) {
      result = { ...result, type };
    }
    if (property.example) {
      result = { ...result, example: property.example };
    }

    if (property.examples) {
      result = { ...result, examples: property.examples };
    }

    if (
      !!property?.enum &&
      Array.isArray(property.enum) //&&
      //_.every(property.enum, !_.isObject)
    ) {
      result = this.createPropertyColSpecificationEnum(property.enum);
    }

    if (
      property?.required &&
      Array.isArray(property.required) &&
      _.every(property.required, _.isString)
    ) {
      const notAppliedRequired = _.filter(
        property.required,
        (req) => !_.isObject(property?.properties?.[req])
      );
      if (_.size(notAppliedRequired) > 0) {
        result = { ...result, required: notAppliedRequired };
      }
    }

    const specificationKeys = _.filter(_.keys(property), (propertyName) =>
      this.diagramVisualization.isSpecificationProperty(
        type,
        property,
        propertyName,
        isRoot,
        isDef,
        path
      )
    );
    return this.formatJSON(
      _.reduce(
        specificationKeys,
        (r, notExpandedPropertyName) => ({
          ...r,
          [notExpandedPropertyName]: property[notExpandedPropertyName]
        }),
        result
      )
    );
  }

  private createPropertyCol(
    tableId: string,
    property: any,
    propertyName: string,
    required: string[],
    type: string,
    isArrayItem: boolean,
    schemaRootTableId: string,
    isRoot: boolean,
    shouldAddDef: boolean,
    parentTableId: string,
    path: string[]
  ): Column | undefined {
    const columnId = uuidv4();
    if (
      (!property &&
        typeof property !== "object" &&
        typeof property !== "boolean") ||
      propertyName === "example" ||
      propertyName === "examples"
    ) {
      return undefined;
    }
    let datatype;
    let refSpec = {};
    let ref = "";
    let useSchemaId = false;
    if (this.refProvider.isRef(property)) {
      const { id, specialRef, specRef, refUseSchemaId } =
        this.refProvider.getOrCreateRef(
          schemaRootTableId,
          property,
          parentTableId
        );
      if (id) {
        datatype = id;
        type = id;
        useSchemaId = refUseSchemaId;
      } else if (specialRef) {
        ref = specialRef;
        type = JSONTableObjectTypes.ANY;
        datatype = tableId ? tableId : uuidv4();
        this.createDatatypeTable(
          datatype,
          property,
          isRoot,
          JSONTableObjectTypes.ANY,
          propertyName === "properties" ? required : [],
          shouldAddDef,
          schemaRootTableId,
          false,
          parentTableId,
          this.buildPath(path, propertyName, "5")
        );
      } else if (specRef) {
        refSpec = { ...refSpec, ...specRef };
        type = JSONTableObjectTypes.ANY;
        datatype = tableId ? tableId : uuidv4();
        this.createDatatypeTable(
          datatype,
          property,
          isRoot,
          JSONTableObjectTypes.ANY,
          propertyName === "properties" ? required : [],
          shouldAddDef,
          schemaRootTableId,
          false,
          parentTableId,
          this.buildPath(path, propertyName, "6")
        );
      }
    } else {
      datatype = tableId ? tableId : uuidv4();
      this.createDatatypeTable(
        datatype,
        property,
        isRoot,
        type,
        propertyName === "properties" ? required : [],
        shouldAddDef,
        schemaRootTableId,
        false,
        parentTableId,
        path
      );
    }

    const specification = this.createPropertyColSpecification(
      property,
      type,
      false,
      false,
      refSpec,
      true,
      path
    );

    const x = {
      ...this.createColumnStub(),
      id: columnId,
      name: isArrayItem ? `` : this.escapePatternProperties(propertyName),
      datatype,
      specification,
      ref,
      useSchemaId,
      nn: required?.includes(propertyName) || false,
      ...(!!property?.description && _.isString(property.description)
        ? { comment: this.escapeDescription(property.description) }
        : {})
    };
    return x;
  }

  private escapeDescriptionString(str: string) {
    return ("" + str)?.replace(/["'\\\n\r\u2028\u2029]/g, function (character) {
      // Escape all characters not included in SingleStringCharacters and
      // DoubleStringCharacters on
      // http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.4
      switch (character) {
        case '"':
        case "'":
          return str?.startsWith("```") ? "\\" + character : character;
        case "\\":
          return "\\" + character;
        // Four possible LineTerminator characters need to be escaped:
        case "\n":
          return "\\n";
        case "\r":
          return "\\r";
        case "\u2028":
          return "\\u2028";
        case "\u2029":
          return "\\u2029";
      }
    });
  }

  private escapeDescription(str: string) {
    try {
      return this.escapeDescriptionString(str);
    } catch (e) {
      console.log(e);
    }
    return str;
  }

  private escapePatternProperties(str: string) {
    try {
      return str?.replace(/[\\]/gi, "\\\\")?.replace(/["]/gi, '\\"');
    } catch (e) {
      console.log(e);
    }
    return str;
  }

  private createColumnStub(): any {
    return {
      name: "properties",
      datatype: "",
      param: "",
      pk: false,
      nn: false,
      comment: "",
      defaultvalue: "",
      data: "",
      collation: "",
      isHidden: false,
      list: false
    };
  }
}

class IdProperty {
  defsPropertyName: string;
  tableId: string;
  propertyName: string;
  id: any;
}
