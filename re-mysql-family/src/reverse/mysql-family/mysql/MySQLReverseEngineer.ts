import {
  MainLayoutDiagramProvider,
  ReverseEngineer,
  ReverseOptions,
  SQLHandledConnection
} from "re";

import { MemoryAutolayout } from "al";
import { ModelBuilderFactory } from "../common/model/ModelBuilderFactory";
import { MoonModelerModel } from "common";
import { MySQLFamilyKnownIdRegistry } from "../common/model/provider/MySQLFamilyKnownIdRegistry";
import { MySQLFeatures } from "./MySQLFeatures";
import fs from "fs";

export class MySQLReverseEngineer extends ReverseEngineer<
  MySQLFeatures,
  SQLHandledConnection<MySQLFeatures>
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
    connection: SQLHandledConnection<MySQLFeatures>
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
