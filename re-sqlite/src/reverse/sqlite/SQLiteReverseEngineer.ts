import { KnownIdRegistry, ReverseEngineer } from "re";

import { MoonModelerModel } from "common";
import { SQLiteFeatures } from "./sqlite-features";
import { SQLiteHandledConnection } from "../../db/sqlite/sqlite-handled-connection";
import { SQLiteModelBuilderFactory } from "./SQLiteModelBuilderFactory";
import { SQLiteQuotation } from "../../db/sqlite/sqlite-quotation";
import fs from "fs";

export class SQLiteReverseEngineer extends ReverseEngineer<
  SQLiteFeatures,
  SQLiteHandledConnection
> {
  protected async prepareModel(
    connection: SQLiteHandledConnection
  ): Promise<MoonModelerModel> {
    let model: MoonModelerModel = undefined;
    const existsModelFile =
      this.reverseOptions.modelToUpdateFilename &&
      fs.existsSync(this.reverseOptions.modelToUpdateFilename);

    if (existsModelFile) {
      model = JSON.parse(
        fs.readFileSync(this.reverseOptions.modelToUpdateFilename).toString()
      );
      fs.unlinkSync(this.reverseOptions.modelToUpdateFilename);
    }

    const modelBuilderFactory = new SQLiteModelBuilderFactory(
      connection,
      this.reverseOptions,
      new SQLiteQuotation(),
      new KnownIdRegistry(false, true, model)
    );
    const modelBuilder = modelBuilderFactory.createBuilder();
    return modelBuilder.build();
  }
}
