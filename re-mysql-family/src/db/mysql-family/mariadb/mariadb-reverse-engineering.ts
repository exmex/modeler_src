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

import { MariaDBConnectionProvider } from "./MariaDBConnectionProvider";
import { MariaDBReverseEngineer } from "../../../reverse/mysql-family/mariadb/MariaDBReverseEngineer";
import { MariaDBSshConnectionProvider } from "./MariaDBSshConnectionProvider";
import { ModelBuilderFactory } from "../../../reverse/mysql-family/common/model/ModelBuilderFactory";
import { MySQLFamilyMessagePrettier } from "../MySQLFamilyMessagePrettier";
import { ReverseEngineering } from "re/src/db/ReverseEngineering";

export class MariaDBReverseEngineering implements ReverseEngineering {
  public constructor(
    private connectionId: string,
    private connectionName: string,
    private server: string,
    private user: string,
    private database: string,
    private outputFilename: string,
    private sampleSize: number,
    private autolayout: boolean,
    private ssh: Ssh,
    private ssl: Ssl,
    private timeout: number,
    private password?: string,
    private infoFilename?: string,
    private originalModelFilename?: string
  ) {}

  public async run(): Promise<void> {
    const info = InfoFactory.create(
      this.infoFilename,
      new MySQLFamilyMessagePrettier()
    );
    try {
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

      const provider = (await this.ssh.provide()).host
        ? new MariaDBSshConnectionProvider(
            this.ssh,
            this.ssl,
            this.server,
            this.user,
            this.timeout,
            this.database,
            this.password
          )
        : new MariaDBConnectionProvider(
            this.ssl,
            this.server,
            this.user,
            this.timeout,
            this.database,
            this.password
          );

      const executor = new Executor(
        info,
        provider,
        new MariaDBReverseEngineer(
          reOptions,
          new MemoryAutolayout(true, EAutoLayoutType.SimpleGrid),
          new ModelBuilderFactory(),
          this.database
        )
      );
      await executor.execute();
    } catch (error) {
      info.reportError(error, Category.CONNECTION);
    }
  }
}
