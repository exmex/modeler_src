import {
  MainLayoutDiagramProvider,
  ReverseEngineer,
  ReverseOptions,
  SQLHandledConnection
} from "re";

import { MariaDBFeatures } from "./MariaDBFeatures";
import { MemoryAutolayout } from "al";
import { ModelBuilderFactory } from "../common/model/ModelBuilderFactory";
import { MoonModelerModel } from "common";
import { MySQLFamilyKnownIdRegistry } from "../common/model/provider/MySQLFamilyKnownIdRegistry";
import fs from "fs";

export class MariaDBReverseEngineer extends ReverseEngineer<
  MariaDBFeatures,
  SQLHandledConnection<MariaDBFeatures>
> {
  public constructor(
    reverseOptions: ReverseOptions,
    autolayout: MemoryAutolayout,
    private modelBuilderFactory: ModelBuilderFactory,
    private schema: string
  ) {
    super(reverseOptions, autolayout, new MainLayoutDiagramProvider());
  }

  protected async prepareModel(
    connection: SQLHandledConnection<MariaDBFeatures>
  ): Promise<MoonModelerModel> {
    let model: MoonModelerModel = undefined;
    const existsModelFile =
      this.reverseOptions.modelToUpdateFilename &&
      fs.existsSync(this.reverseOptions.modelToUpdateFilename);

    if (existsModelFile) {
      model = JSON.parse(
        fs.readFileSync(this.reverseOptions.modelToUpdateFilename).toString()
      );
    }

    const features = await connection.getFeatures();
    const modelBuilder = this.modelBuilderFactory.createBuilder(
      connection,
      this.schema,
      this.reverseOptions,
      features,
      new MySQLFamilyKnownIdRegistry(
        this.reverseOptions.includeSchema,
        false,
        model
      )
    );
    return modelBuilder.build();
  }
}
