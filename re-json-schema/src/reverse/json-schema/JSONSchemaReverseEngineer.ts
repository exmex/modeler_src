import { JSONSchemaFeatures } from "../../db/json-schema/JSONSchemaFeatures";
import { JSONSchemaHandledConnection } from "../../db/json-schema/JSONSchemaHandledConnection";
import { JSONSchemaModelBuilderFactory } from "./JSONSchemaModelBuilderFactory";
import { JSONSchemaStatistics } from "./JSONSchemaStatistics";
import { MoonModelerModel } from "common";
import { ReverseEngineer } from "re";

export class JSONSchemaReverseEngineer extends ReverseEngineer<
  JSONSchemaFeatures,
  JSONSchemaHandledConnection
> {
  protected showStatistics(model: MoonModelerModel): void {
    JSONSchemaStatistics.showReverseDetails(model);
  }

  protected async prepareModel(
    connection: JSONSchemaHandledConnection
  ): Promise<MoonModelerModel> {
    const modelBuilderFactory = new JSONSchemaModelBuilderFactory(
      connection.schema,
      connection.strict,
      connection.format
    );
    const modelBuilder = modelBuilderFactory.createBuilder();
    return modelBuilder.build();
  }
}
