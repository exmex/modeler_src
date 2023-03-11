const { EAutoLayoutType, MemoryAutolayout } = require("al");

import {
  Category,
  Executor,
  InfoFactory,
  ReferenceSearch,
  ReverseOptions,
  Ssh,
  Ssl
} from "re";

import { PgConnectionProvider } from "./PgConnectionProvider";
import { PgMessagePrettier } from "./PgMessagePrettier";
import { PgReverseEngineer } from "../../reverse/pg/PgReverseEngineer";
import { PgSshConnectionProvider } from "./pg-ssh-connection-provider";

export class PgReverseEngineering {
  public constructor(
    private connectionId: string,
    private connectionName: string,
    private server: string,
    private database: string,
    private schema: string,
    private user: string,
    private outputFilename: string,
    private sampleSize: number,
    private autolayout: boolean,
    private ssh: Ssh,
    private ssl: Ssl,
    private password?: string,
    private infoFilename?: string,
    private includeSchema?: string,
    private originalModelFilename?: string
  ) {}

  public async run(): Promise<void> {
    const info = InfoFactory.create(this.infoFilename, new PgMessagePrettier());
    try {
      if (!this.schema) {
        throw new Error("Schema is not defined.");
      }
      const provider = (await this.ssh.provide()).host
        ? new PgSshConnectionProvider(
            this.ssh,
            this.ssl,
            this.server,
            this.user,
            this.password,
            this.database,
            this.schema
          )
        : new PgConnectionProvider(
            this.ssl,
            this.server,
            this.user,
            this.password,
            this.database,
            this.schema
          );
      const reOptions = new ReverseOptions(
        this.outputFilename,
        this.sampleSize,
        this.autolayout,
        this.includeSchema === "true",
        "data",
        ReferenceSearch.ALL,
        this.connectionId,
        this.connectionName,

        this.originalModelFilename
      );

      const executor = new Executor(
        info,
        provider,
        new PgReverseEngineer(
          reOptions,
          new MemoryAutolayout(true, EAutoLayoutType.SimpleGrid),
          this.schema
        )
      );
      await executor.execute();
    } catch (error) {
      info.reportError(error, Category.CONNECTION);
    }
  }
}
