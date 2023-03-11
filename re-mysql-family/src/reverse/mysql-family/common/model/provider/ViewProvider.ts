import { KnownIdRegistry, ModelPartProvider } from "re";
import { OtherObject, OtherObjects } from "common";

import { MySQLFamilyFeatures } from "../../MySQLFamilyFeatures";
import { Query } from "../../Query";
import { ViewMetadata } from "../../metadata/ViewMetadata";
import { ViewRow } from "../../query/ViewDbQuery";
import { ViewSourceGenerator } from "../../generator/ViewSourceGenerator";

export class ViewProvider implements ModelPartProvider<OtherObjects> {
  public constructor(
    private dbQuery: Query<ViewRow[]>,
    private features: MySQLFamilyFeatures,
    private knownIdRegistry: KnownIdRegistry
  ) {}
  public async provide(): Promise<OtherObjects> {
    const viewsQueryResult: ViewRow[] = await this.dbQuery.execute();

    const result: OtherObjects = {};

    viewsQueryResult.forEach((row: ViewRow): void => {
      const schema = "";
      const name = row.TABLE_NAME;
      const type = "View";
      const id = this.knownIdRegistry.getOtherObjectId(schema, name, type);

      const generator = new ViewSourceGenerator(
        new ViewMetadata(
          row.SECURITY_TYPE,
          row.TABLE_NAME,
          row.VIEW_DEFINITION,
          row.CHECK_OPTION,
          row.DEFINER,
          row.ALGORITHM
        ),
        this.features
      );
      const code = generator.generate();
      const view = this.createView(id, row.TABLE_NAME, code);

      result[id] = view;
    });

    return result;
  }

  private createView(id: string, name: string, code: string): OtherObject {
    return {
      code,
      id,
      name,

      desc: "",
      lines: [],
      type: "View",
      visible: true,
      generate: true,
      generateCustomCode: true
    };
  }
}
