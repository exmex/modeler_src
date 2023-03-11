const { EAutoLayoutType, MemoryAutolayout } = require("al");

import {
  Category,
  Executor,
  InfoFactory,
  MainLayoutDiagramProvider,
  ReferenceSearch,
  ReverseOptions,
  Ssh,
  Ssl
} from "re";

import { MSSQLConnectionProvider } from "./MSSQLConnectionProvider";
import { MSSQLMessagePrettier } from "./MSSQLMessagePrettier";
import { MSSQLReverseEngineer } from "../../reverse/mssql/MSSQLReverseEngineer";
import { MSSQLSshConnectionProvider } from "./mssql-ssh-connection-provider";

export class MSSQLReverseEngineering {
  public constructor(
    private connectionId: string,
    private connectionName: string,
    private host: string,
    private port: number,
    private database: string,
    private user: string,
    private encrypt: boolean,
    private trustServerCertificate: boolean,
    private outputFilename: string,
    private sampleSize: number,
    private autolayout: boolean,
    private ssh: Ssh,
    private ssl: Ssl,
    private password?: string,
    private infoFilename?: string,
    private includeSchema?: string,
    private originalModelFilename?: string
  ) { }

  public async run(): Promise<void> {
    const info = InfoFactory.create(
      this.infoFilename,
      new MSSQLMessagePrettier()
    );
    try {
      const provider = (await this.ssh.provide()).host
        ? new MSSQLSshConnectionProvider(
          this.ssh,
          this.ssl,
          this.host,
          this.port,
          this.user,
          this.encrypt,
          this.trustServerCertificate,
          this.password,
          this.database
        )
        : new MSSQLConnectionProvider(
          this.ssl,
          this.host,
          this.port,
          this.user,
          this.encrypt,
          this.trustServerCertificate,
          this.password,
          this.database
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
        new MSSQLReverseEngineer(
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
