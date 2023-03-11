import { ModelDescription, getAppVersionObject } from "common";
import _ from "lodash";
import { ModelPartProvider, NamesRegistry, Platform } from "re";

import { v4 as uuidv4 } from "uuid";

export class JSONSchemaModelDescriptionProvider
  implements ModelPartProvider<ModelDescription>
{
  public constructor(
    private _namesRegistry: NamesRegistry,
    private _schema: any,
    private _strict: boolean,
    private _format: string
  ) {}

  public async provide(): Promise<ModelDescription> {
    const activeDiagram = this._namesRegistry.diagrams.find(() => true);
    return {
      activeDiagram: activeDiagram ? activeDiagram.id : uuidv4(),
      name: this.getModelCaption(),
      id: uuidv4(),
      desc: "",
      path: "",
      type: this.getType(),
      ...this.getOpenAPIVersion(),
      version: 1,
      parentTableInFkCols: true,
      caseConvention: "under",
      replaceSpace: "_",
      color: "transparent",
      sideSelections: true,
      isDirty: true,
      storedin: getAppVersionObject(process.env.CURRENT_PRODUCT),
      def_coltopk: true,
      def_others: "",
      filePath: "",
      lastSaved: "",
      def_charset: "",
      def_collation: "",
      def_rowformat: "",
      def_tabletype: "",
      embeddedInParentsIsDisplayed: true,
      schemaContainerIsDisplayed: false,
      cardinalityIsDisplayed: false,
      estimatedSizeIsDisplayed: false,
      showDescriptions: true,
      showSpecifications: true,
      showLocallyReferenced: true,
      writeFileParam: false,
      jsonCodeSettings: {
        strict: this._strict,
        definitionKeyName: this.getDefinitionKeyName(),
        format: this._format
      }
    };
  }

  private getModelCaption(): string {
    return this.getType() === Platform.OPENAPI ? "OpenAPI" : "JSON Schema";
  }

  private getType(): string {
    if (!!this._schema?.swagger || !!this._schema?.openapi) {
      return Platform.OPENAPI;
    }

    switch (this._schema?.schema) {
      case "http://json-schema.org/draft-07/schema#":
      case "http://json-schema.org/draft-07/schema":
      case "https://json-schema.org/draft-07/schema#":
      case "https://json-schema.org/draft-07/schema":
      case "http://json-schema.org/draft-06/schema#":
      case "http://json-schema.org/draft-06/schema":
      case "https://json-schema.org/draft-06/schema#":
      case "https://json-schema.org/draft-06/schema":
      case "http://json-schema.org/draft-04/schema#":
      case "http://json-schema.org/draft-04/schema":
      case "https://json-schema.org/draft-04/schema#":
      case "https://json-schema.org/draft-04/schema":
      case "https://json-schema.org/draft/2019-09/schema":
      case "https://json-schema.org/draft/2020-12/schema":
        return Platform.JSONSCHEMA;
    }

    if (
      !!this._schema?.definitions ||
      !!this._schema?.$defs ||
      !!this._schema?.properties ||
      !!this._schema?.patternProperties ||
      !!this._schema?.type
    ) {
      return Platform.JSONSCHEMA;
    }
    return Platform.FULLJSON;
  }

  private getSchemaFromModel(): string {
    const schema = this?._schema;
    switch (schema) {
      case "http://json-schema.org/draft-07/schema#":
      case "http://json-schema.org/draft-07/schema":
      case "https://json-schema.org/draft-07/schema#":
      case "https://json-schema.org/draft-07/schema":
      case "http://json-schema.org/draft-06/schema#":
      case "http://json-schema.org/draft-06/schema":
      case "https://json-schema.org/draft-06/schema#":
      case "https://json-schema.org/draft-06/schema":
      case "http://json-schema.org/draft-04/schema#":
      case "http://json-schema.org/draft-04/schema":
      case "https://json-schema.org/draft-04/schema#":
      case "https://json-schema.org/draft-04/schema":
        return "definitions";
      default:
        return "$defs";
    }
  }

  private getOpenAPIVersion() {
    if (this._schema?.swagger === "2.0") {
      return { openAPIVersion: "2.0" };
    } else if (this._schema?.openapi?.startsWith("3.0")) {
      return { openAPIVersion: "3.0" };
    } else if (this._schema?.openapi?.startsWith("3.1")) {
      return { openAPIVersion: "3.1" };
    }
    return {};
  }

  private getDefinitionKeyName(): string {
    const swagger = this._schema?.swagger;
    if (swagger) {
      return "definitions";
    }

    const schemaFromModel = this.getSchemaFromModel();
    if (!!this._schema.definitions && schemaFromModel !== "definitions") {
      return "definitions";
    }
    if (!!this._schema.$defs && schemaFromModel !== "defs") {
      return "defs";
    }
    return "bySchema";
  }
}
