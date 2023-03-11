import { EAutoLayoutType, MemoryAutolayout } from "al";
import {
  Executor,
  InfoFactory,
  MainLayoutDiagramProvider,
  ReferenceSearch,
  ReverseOptions
} from "re";

import { GraphQLConnectionProvider } from "./GraphQLConnectionProvider";
import { GraphQLMessagePrettier } from "./GraphQLMessagePrettier";
import { GraphQLReverseEngineer } from "../../reverse/graphql/GraphQLReverseEngineer";

export class GraphQLReverseEngineering {
  public constructor(
    private connectionId: string,
    private connectionName: string,
    private sourceType: string,
    private source: string,
    private outputFilename: string,
    private autolayout: boolean,
    private infoFilename?: string,
    private modelToUpdateFilename?: string
  ) {}

  public async run(): Promise<void> {
    const provider = new GraphQLConnectionProvider(
      this.sourceType,
      this.source
    );
    const info = InfoFactory.create(
      this.infoFilename,
      new GraphQLMessagePrettier()
    );
    const reOptions = new ReverseOptions(
      this.outputFilename,
      0,
      this.autolayout,
      false,
      "data",
      ReferenceSearch.ALL,
      this.connectionId,
      this.connectionName,
      this.modelToUpdateFilename
    );

    const executor = new Executor(
      info,
      provider,
      new GraphQLReverseEngineer(
        reOptions,
        new MemoryAutolayout(false, EAutoLayoutType.SimpleGrid),
        new MainLayoutDiagramProvider()
      )
    );
    await executor.execute();
  }
}
