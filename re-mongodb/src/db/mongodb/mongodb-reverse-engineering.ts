const { EAutoLayoutType, MemoryAutolayout } = require("al");

import {
  Category,
  Executor,
  InfoFactory,
  MainLayoutDiagramProvider,
  ReferenceSearch,
  ReverseOptions,
  Ssh
} from "re";

import { Auth } from "./auth";
import { MongoDBConnectionProvider } from "./MongoDBConnectionProvider";
import { MongoDBMessagePrettier } from "./MongoDBMessagePrettier";
import { MongoDBReverseEngineer } from "../../reverse/mongodb/MongoDBReverseEngineer";
import { MongoDBSshConnectionProvider } from "./MongoDBSshConnectionProvider";
import { MongoDBTls } from "./tls/mongodb-tls";

export class MongoDBReverseEngineering {
  public constructor(
    private connectionId: string,
    private connectionName: string,
    private server: string,
    private database: string,
    private directConnection: boolean,
    private retryWrites: boolean,
    private ssh: Ssh,
    private tls: MongoDBTls,
    private auth: Auth,
    private timeout: number,
    private outputFilename: string,
    private autolayout: boolean,
    private sampleSize: number,
    private source: string,
    private referenceSearch: ReferenceSearch,
    private infoFilename?: string,
    private modelToUpdateFilename?: string
  ) {}

  public async run(): Promise<void> {
    const info = InfoFactory.create(
      this.infoFilename,
      new MongoDBMessagePrettier()
    );
    try {
      const provider = (await this.ssh.provide()).host
        ? new MongoDBSshConnectionProvider(
            this.ssh,
            this.tls,
            this.server,
            this.timeout,
            this.directConnection,
            this.retryWrites,
            this.auth,
            this.database
          )
        : new MongoDBConnectionProvider(
            this.tls,
            this.server,
            this.timeout,
            this.directConnection,
            this.retryWrites,
            this.auth,
            this.database
          );
      const reOptions = new ReverseOptions(
        this.outputFilename,
        this.sampleSize,
        this.autolayout,
        false,
        this.source,
        this.referenceSearch,
        this.connectionId,
        this.connectionName,
        this.modelToUpdateFilename
      );
      const executor = new Executor(
        info,
        provider,
        new MongoDBReverseEngineer(
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
