const { EAutoLayoutType, MemoryAutolayout } = require("al");

import { ERDLayoutDiagramProvider, Executor, InfoFactory, ReferenceSearch, ReverseOptions } from "re";

import { JSONSchemaConnectionProvider } from "./JSONSchemaConnectionProvider";
import { JSONSchemaMessagePrettier } from "./JSONSchemaMessagePrettier";
import { JSONSchemaReverseEngineer } from "../../reverse/json-schema/JSONSchemaReverseEngineer";

export class JSONSchemaReverseEngineering {
  public constructor(
    private schemaFilename: string,
    private outputFilename: string,
    private autolayout: boolean,
    private infoFilename?: string
  ) { }

  public async run(): Promise<void> {
    const provider = new JSONSchemaConnectionProvider(this.schemaFilename);
    const info = InfoFactory.create(
      this.infoFilename,
      new JSONSchemaMessagePrettier()
    );
    const reOptions = new ReverseOptions(
      this.outputFilename,
      0,
      this.autolayout,
      false,
      "data",
      ReferenceSearch.ALL
    );

    const executor = new Executor(
      info,
      provider,
      new JSONSchemaReverseEngineer(
        reOptions,
        new MemoryAutolayout(true, EAutoLayoutType.ParentChildrenGrid),
        new ERDLayoutDiagramProvider()
      )
    );
    await executor.execute();
  }
}
