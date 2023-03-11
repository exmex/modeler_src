import {
  DependenciesRegistry,
  MainLayoutDiagramProvider,
  NamesRegistry,
  ReverseEngineer,
  ReverseOptions,
  SQLHandledConnection
} from "re";

import { MSSQLContainerNameProvider } from "./model/provider/MSSQLContainerNameProvider";
import { MSSQLFeatures } from "./MSSQLFeatures";
import { MSSQLKnownIdRegistry } from "./model/provider/MSSQLKnownIdRegistry";
import { MSSQLModelBuilderFactory } from "./MSSQLModelBuilderFactory";
import { MSSQLQuotation } from "../../db/mssql/mssql-quotation";
import { MSSQLUserDefinedTypeRegistry } from "./MSSQLUserDefinedTypeRegistry";
import { MoonModelerModel } from "common";
import { NameBuilder } from "re/dist/model/provider/NameBuilder";
import fs from "fs";

export class MSSQLReverseEngineer extends ReverseEngineer<
  MSSQLFeatures,
  SQLHandledConnection<MSSQLFeatures>
> {
  protected async prepareModel(
    connection: SQLHandledConnection<MSSQLFeatures>
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

    const features = await connection.getFeatures();
    const quotation = new MSSQLQuotation();
    const modelBuilderFactory = new MSSQLModelBuilderFactory(
      connection,
      this.reverseOptions,
      features,
      quotation,

      new MSSQLUserDefinedTypeRegistry(),
      new NamesRegistry(new NameBuilder(new MSSQLContainerNameProvider())),
      new DependenciesRegistry(),
      new MSSQLKnownIdRegistry(this.reverseOptions.includeSchema, false, model)
    );
    const modelBuilder = modelBuilderFactory.createBuilder();
    return modelBuilder.build();
  }
}
