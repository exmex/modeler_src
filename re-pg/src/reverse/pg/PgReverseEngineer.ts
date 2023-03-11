import {
  DependenciesRegistry,
  MainLayoutDiagramProvider,
  NamesRegistry,
  ReverseEngineer,
  ReverseOptions,
  SQLHandledConnection
} from "re";

import { ArrayParser } from "./model/provider/ArrayParser";
import { MemoryAutolayout } from "al";
import { MoonModelerModel } from "common";
import { NameBuilder } from "re/dist/model/provider/NameBuilder";
import { PgContainerNameProvider } from "./model/provider/PgContainerNameProvider";
import { PgFeatures } from "./PgFeatures";
import { PgIdentifierParser } from "../../db/pg/pg-identifier-parser";
import { PgKnownIdRegistry } from "./model/provider/PgKnownIdRegistry";
import { PgModelBuilderFactory } from "./PgModelBuilderFactory";
import { PgQuotation } from "../../db/pg/pg-quotation";
import { PgUserDataTypeRegistry } from "./PgUserDataTypeRegistry";
import { SequenceRegistry } from "./SequenceRegistry";
import fs from "fs";

export class PgReverseEngineer extends ReverseEngineer<
  PgFeatures,
  SQLHandledConnection<PgFeatures>
> {
  private schema: string;

  public constructor(
    reverseOptions: ReverseOptions,
    autolayout: MemoryAutolayout,
    schema: string
  ) {
    super(reverseOptions, autolayout, new MainLayoutDiagramProvider());
    this.schema = schema;
  }

  protected async prepareModel(
    connection: SQLHandledConnection<PgFeatures>
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
    const quotation = new PgQuotation();
    const modelBuilderFactory = new PgModelBuilderFactory(
      connection,
      this.schema,
      this.reverseOptions,
      features,
      quotation,
      new PgIdentifierParser(),
      new PgUserDataTypeRegistry(),
      new ArrayParser(quotation),
      new NamesRegistry(new NameBuilder(new PgContainerNameProvider())),
      new DependenciesRegistry(),
      new SequenceRegistry(),
      new PgKnownIdRegistry(this.reverseOptions.includeSchema, false, model)
    );
    const modelBuilder = modelBuilderFactory.createBuilder();
    return modelBuilder.build();
  }
}
