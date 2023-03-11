import {
  Category,
  Executor,
  InfoFactory,
  MainLayoutDiagramProvider,
  ReferenceSearch,
  ReverseOptions
} from "re";
import { EAutoLayoutType, MemoryAutolayout } from "al";

import { SQLiteConnectionProvider } from "./sqlite-connection-provider";
import { SQLiteMessagePrettier } from "./SQLiteMessagePrettier";
import { SQLiteReverseEngineer } from "../../reverse/sqlite/SQLiteReverseEngineer";

export class SQLiteReverseEngineering {
  public constructor(
    private connectionId: string,
    private connectionName: string,
    private filename: string,
    private outputFilename: string,
    private sampleSize: number,
    private autolayout: boolean,
    private infoFilename?: string,
    private originalModelFilename?: string
  ) {}

  public async run(): Promise<void> {
    const info = InfoFactory.create(
      this.infoFilename,
      new SQLiteMessagePrettier()
    );
    try {
      const provider = new SQLiteConnectionProvider(this.filename);
      const connection = await provider.createConnection();
      console.log(await connection.getServerVersion());
      const reOptions = new ReverseOptions(
        this.outputFilename,
        this.sampleSize,
        this.autolayout,
        false,
        "data",
        ReferenceSearch.ALL,
        this.connectionId,
        this.connectionName,
        this.originalModelFilename
      );

      const executor = new Executor(
        info,
        provider,
        new SQLiteReverseEngineer(
          reOptions,
          new MemoryAutolayout(true, EAutoLayoutType.SimpleGrid),
          new MainLayoutDiagramProvider()
        )
      );
      await executor.execute();
    } catch (error) {
      info.reportError(error, Category.CONNECTION);
    }
  }
}
