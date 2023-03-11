import { MoonModelerModel } from "../structure";
import _ from "lodash";
import { schema } from "../json_schema/modeler-schema";
import Ajv2020 from "ajv/dist/2020";

//const Ajv2020 = require("ajv/dist/2020");


const ajv = new Ajv2020({ strict: false, allErrors: true });
const validate = ajv.compile(schema);

async function isValid(store: any): Promise<boolean> {
  const valid = validate(store);
  if (!valid) {
    console.log(validate.errors);
    return false;
  }
  return true;
}

export function pathToString(instancePath: string[]): string {
  return "/" + instancePath.join("/");
}

class Mapper {
  public constructor(private _schema: any) {}

  public getSchemaPathForInstancePath(
    instancePath: string[],
    skipLastRef: boolean
  ): string[] {
    return this.getSchemaPathForNextProperty(instancePath, ["#"], skipLastRef);
  }

  private getSchemaPathForNextProperty(
    instancePath: string[],
    currentSubSchemaPath: string[],
    skipLastRef: boolean
  ): string[] {
    const currentSubSchema = this.getSubSchema(currentSubSchemaPath);

    const refPath = this.followRef(instancePath, currentSubSchema, skipLastRef);
    if (!!refPath) {
      return refPath;
    }

    if (_.isEmpty(instancePath)) {
      return currentSubSchemaPath;
    }

    const [firstPathElement, ...restPath] = instancePath;

    const propertyPath = this.followProperty(
      firstPathElement,
      restPath,
      currentSubSchema,
      currentSubSchemaPath,
      skipLastRef
    );
    if (!!propertyPath) {
      return propertyPath;
    }

    const patternPropertyPath = this.followPatternProperty(
      firstPathElement,
      restPath,
      currentSubSchema,
      currentSubSchemaPath,
      skipLastRef
    );
    if (!!patternPropertyPath) {
      return patternPropertyPath;
    }

    const itemsPath = this.followItems(
      firstPathElement,
      restPath,
      currentSubSchema,
      currentSubSchemaPath,
      skipLastRef
    );
    if (!!itemsPath) {
      return itemsPath;
    }

    return undefined;
  }

  private followRef(
    instancePath: string[],
    currentSubSchema: any,
    skipLastRef: boolean
  ) {
    const ref = currentSubSchema?.$ref;

    if (ref && (!skipLastRef || (skipLastRef && !_.isEmpty(instancePath)))) {
      const refSchemaPath = ref.split("/");
      return this.getSchemaPathForNextProperty(
        instancePath,
        refSchemaPath,
        skipLastRef
      );
    }
  }

  private followProperty(
    propertyName: string,
    restPath: string[],
    currentSubSchema: any,
    currentSchemaPath: string[],
    skipLastRef: boolean
  ): string[] {
    const properties = currentSubSchema?.properties;
    const property = properties?.[propertyName];
    if (property) {
      return this.getSchemaPathForNextProperty(
        restPath,
        [...currentSchemaPath, "properties", propertyName],
        skipLastRef
      );
    }

    return undefined;
  }

  private followPatternProperty(
    propertyName: string,
    restPath: string[],
    currentSubSchema: any,
    currentSchemaPath: string[],
    skipLastRef: boolean
  ): string[] {
    const patternProperties = currentSubSchema?.patternProperties;

    const patternPropertyCompliance = _.find(
      _.keys(patternProperties),
      (key) => !!propertyName?.match(new RegExp(key))
    );

    if (patternPropertyCompliance) {
      return this.getSchemaPathForNextProperty(
        restPath,
        [...currentSchemaPath, "patternProperties", patternPropertyCompliance],
        skipLastRef
      );
    }

    return undefined;
  }

  private followItems(
    propertyName: string,
    restPath: string[],
    currentSubSchema: any,
    currentSchemaPath: string[],
    skipLastRef: boolean
  ): string[] {
    const items = currentSubSchema?.items;
    if (!!items && _.isInteger(+propertyName)) {
      return this.getSchemaPathForNextProperty(
        restPath,
        [...currentSchemaPath, "items"],
        skipLastRef
      );
    }

    return undefined;
  }

  public getSubSchema(schemaPath: string[]): any {
    let result = undefined;

    if (_.size(schemaPath) === 0) {
      result = undefined;
    } else if (_.size(schemaPath) === 1) {
      result = this.getSubSchemaForNextElement([], this._schema);
    } else {
      const restPath = schemaPath.slice(1);
      result = this.getSubSchemaForNextElement(restPath, this._schema);
    }
    return result;
  }

  private getSubSchemaForNextElement(
    schemaPath: string[],
    currentSubSchema: any
  ): any {
    //console.dir({ schemaPath, currentSubSchema }, { depth: 1 });
    if (_.isEmpty(schemaPath)) {
      return currentSubSchema;
    }

    const [firstPathElement, ...restPath] = schemaPath;

    return this.getSubSchemaForNextElement(
      restPath,
      currentSubSchema?.[firstPathElement]
    );
  }
}

function getSubschema(instancePath: string) {
  const mapper = new Mapper(schema);
  const splittedPath = instancePath.split("/").slice(1);
  const updatedPath = splittedPath?.[0] == "" ? [] : splittedPath;
  const schemaPathOfProperty = mapper.getSchemaPathForInstancePath(
    updatedPath,
    true
  );
  const schemaPath = mapper.getSchemaPathForInstancePath(updatedPath, false);

  const subschemaOfProperty = mapper.getSubSchema(schemaPathOfProperty);
  const subschemaOfPropertyWithoutRef = !_.isEmpty(subschemaOfProperty)
    ? _.omit(mapper.getSubSchema(schemaPathOfProperty), ["$ref"])
    : subschemaOfProperty;
  const subschema = mapper.getSubSchema(schemaPath);
  const mixedSubschema =
    subschemaOfPropertyWithoutRef !== undefined || subschema !== undefined
      ? { ...subschemaOfPropertyWithoutRef, ...subschema }
      : undefined;
  return mixedSubschema;
}

function getModelNode(model: MoonModelerModel, instancePath: string) {
  if (instancePath === "/") {
    return model;
  }
  return _.reduce(
    instancePath.split("/").slice(1),
    (r, i) => {
      const res = r?.[i];
      if (!!res) {
        return res;
      }
      return undefined;
    },
    model as any
  );
}

function getMappedModelNode(
  model: MoonModelerModel,
  instancePath: string
): { node: any; path: string[] } {
  if (instancePath === "/") {
    return { node: model, path: [] };
  }
  const mapper = new Mapper(schema);

  return _.reduce(
    instancePath.split("/").slice(1),
    (r, instancePathPart) => {
      if (!!r) {
        let res = r?.node[instancePathPart];
        const propertyFound = res;

        if (propertyFound) {
          return { node: res, path: [...r.path, instancePathPart] };
        }

        if (!propertyFound) {
          return findMappedModelNode(mapper, r, instancePathPart);
        }
      }
      return undefined;
    },
    { node: model as any, path: [] }
  );
}

function findMappedModelNode(
  mapper: Mapper,
  nodeWithPath: { node: any; path: any[] },
  instancePathPart: string
) {
  const mappedPropertyDetails = findMappedProperty(
    mapper,
    nodeWithPath,
    instancePathPart
  );
  if (mappedPropertyDetails) {
    const modelMappedPropertyNode =
      nodeWithPath?.node[mappedPropertyDetails.propName];
    const allModelNodesFulfillPropertyLimitation =
      findModelNodeForMappedProperty(
        modelMappedPropertyNode,
        mappedPropertyDetails
      );
    return {
      node: allModelNodesFulfillPropertyLimitation,
      path: [...nodeWithPath.path, instancePathPart]
    };
  }
  return undefined;
}

function findModelNodeForMappedProperty(
  modelMappedPropertyNode: any,
  mappedPropertyDetails: any
) {
  return _.reduce(
    _.keys(modelMappedPropertyNode),
    (r, key) => {
      if (
        modelMappedPropertyNode[key]?.[
          mappedPropertyDetails.conditionProperty
        ] === _.upperFirst(mappedPropertyDetails.value)
      ) {
        return { ...r, [key]: modelMappedPropertyNode[key] };
      }
      return r;
    },
    {}
  );
}

function findMappedProperty(
  mapper: Mapper,
  nodeWithPath: { node: any; path: any[] },
  instancePathPart: string
) {
  const schemaPath = mapper.getSchemaPathForInstancePath(
    nodeWithPath.path,
    true
  );
  const subschema = mapper.getSubSchema(schemaPath);
  const mappedPropertyDetails = _.reduce(
    _.keys(subschema.properties),
    (r, propName) => {
      const prop = subschema.properties[propName];
      const value = _.findKey(
        prop["x-map-by-property"]?.schemas,
        (schema) => schema["new-key"] === instancePathPart
      );
      if (!!value) {
        return {
          propName,
          property: instancePathPart,
          conditionProperty: prop["x-map-by-property"]?.property,
          value
        };
      }
      return r;
    },
    undefined
  );
  return mappedPropertyDetails;
}

function getSchemaNode(schemaPath: string) {
  return _.reduce(
    schemaPath.split("/").slice(1),
    (r, pathPart) => {
      const res = r?.[pathPart];
      if (!!res) {
        return res;
      }
      return undefined;
    },
    schema as any
  );
}

enum XProperty {
  NAME = "name",
  ID = "id",
  ID_REF = "id-ref",
  TYPE = "type",
  ARRAY_OBJECT = "array-object",
  DESC = "desc"
}

enum XControlProperty {
  X_TYPE = "x-type",
  X_REF_PATH = "x-ref-path"
}

function getModelNodeProperty(
  model: MoonModelerModel,
  instancePath: string,
  xProperty: XProperty,
  shouldSearchInner: boolean
) {
  const subschema = getSubschema(instancePath);
  const node = getModelNode(model, instancePath);

  if (shouldSearchInner) {
    const nameProperty = _.find(_.keys(subschema.properties), (item) => {
      const isXProperty =
        subschema.properties[item][XControlProperty.X_TYPE] === xProperty;
      if (!!isXProperty) {
        return true;
      }

      const ref = subschema.properties[item].$ref;
      if (!!ref) {
        const refSubschema = getSchemaNode(ref);

        if (refSubschema[XControlProperty.X_TYPE] === xProperty) {
          return true;
        }
      }
    });

    return node?.[nameProperty];
  } else {
    const isXProperty = subschema[XControlProperty.X_TYPE] === xProperty;
    if (isXProperty) {
      return node;
    }
  }

  return undefined;
}

function getModelNodePropertyRelative(
  modelNode: any,
  instancePath: string,
  xProperty: XProperty
) {
  const subschema = getSubschema(instancePath);

  const nameProperty = _.find(_.keys(subschema.properties), (item) => {
    const isXProperty =
      subschema.properties[item][XControlProperty.X_TYPE] === xProperty;
    if (!!isXProperty) {
      return true;
    }
  });

  return modelNode?.[nameProperty];
}

function getInstancePathOfXRefId(
  model: MoonModelerModel,
  xRefPath: string[],
  index: number,
  currentInstancePath: string,
  id: string
): any {
  const pivot = xRefPath[index];

  if (pivot === "*") {
    const node = getModelNode(model, currentInstancePath);
    const asteriskKeys = _.keys(node);
    for (let i = 0; i < asteriskKeys.length; i++) {
      const asteriskResult = getInstancePathOfXRefId(
        model,
        xRefPath,
        index + 1,
        `${currentInstancePath}/${asteriskKeys[i]}`,
        id
      );
      if (!!asteriskResult) {
        return asteriskResult;
      }
    }
  } else {
    if (xRefPath.length - 1 === index) {
      const isArray = getModelNodeProperty(
        model,
        `${currentInstancePath}/${pivot}`,
        XProperty.ARRAY_OBJECT,
        false
      );
      if (isArray) {
        const arrayNode = getModelNode(
          model,
          `${currentInstancePath}/${pivot}`
        );
        const indexOfIdInArray = _.findIndex(
          arrayNode,
          (item) => (item as any).id === id
        );
        if (indexOfIdInArray === -1) {
          return undefined;
        }
        return `${currentInstancePath}/${pivot}/${indexOfIdInArray}`;
      }
      const pathToId = `${currentInstancePath}/${pivot}/${id}`;
      const idNode = getModelNode(model, pathToId);
      if (!!idNode) {
        return `${currentInstancePath}/${pivot}/${id}`;
      }
      return undefined;
    }

    const nextInstancePath = `${currentInstancePath}/${pivot}`;

    return getInstancePathOfXRefId(
      model,
      xRefPath,
      index + 1,
      nextInstancePath,
      id
    );
  }
}

const EMPTY_INSTANCE_PATH = "";
const START_INSTANCE_PATH_INDEX = 0;

function getInstancePathByXRefPath(
  model: MoonModelerModel,
  instancePath: string
): string {
  const subschema = getSubschema(instancePath);
  const node = getModelNode(model, instancePath);

  const a = _.find(
    _.map(subschema[XControlProperty.X_REF_PATH], (item) => {
      const refInstancePath = getInstancePathOfXRefId(
        model,
        item,
        START_INSTANCE_PATH_INDEX,
        EMPTY_INSTANCE_PATH,
        node
      );
      return refInstancePath;
    }),
    (item) => !!item
  );
  return a;
}

function getReferencedObjectByXRefPath(
  model: MoonModelerModel,
  xRefPaths: string[][],
  id: string
): string {
  const a = _.find(
    _.map(xRefPaths, (item) => {
      const refInstancePath = getInstancePathOfXRefId(
        model,
        item,
        START_INSTANCE_PATH_INDEX,
        EMPTY_INSTANCE_PATH,
        id
      );
      return refInstancePath;
    }),
    (item) => !!item
  );
  //console.dir({ xRefPaths, id });
  return a;
}

export {
  isValid,
  getModelNode,
  getMappedModelNode,
  getSubschema,
  getModelNodeProperty,
  getSchemaNode,
  getInstancePathByXRefPath,
  getModelNodePropertyRelative,
  getReferencedObjectByXRefPath,
  XProperty,
  XControlProperty
};
