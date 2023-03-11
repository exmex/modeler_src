import _ from "lodash";
import { extractSchemasForPath } from "./DetectSchema";
import v_2_0 from "./default_schemas/openapi/v2.0";
import v_3_0 from "./default_schemas/openapi/v3.0";
import v_3_1 from "./default_schemas/openapi/v3.1";

export class SchemaProvider {
  public isJSONSchema() {
    return !this._schema;
  }
  public isOpenAPI() {
    return !!this._schema;
  }

  public isOpenAPIJSONSchema(path: string[]): boolean {
    const schemasForPath = extractSchemasForPath(
      { root: this._schema, path },
      { globalSchema: this._schema, type: "OPENAPI" }
    );

    return !!_.find(schemasForPath, (context) => context.isJSONSchema);
  }
  private _schema: any;

  public loadSchema(schema: any) {
    if (schema?.swagger === "2.0") {
      this._schema = v_2_0;
    } else if (schema?.openapi?.startsWith("3.0")) {
      this._schema = v_3_0;
    } else if (schema?.openapi?.startsWith("3.1")) {
      this._schema = v_3_1;
    } else {
      this._schema = undefined;
    }
  }
}
