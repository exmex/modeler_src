import { Category, Executor, InfoFactory, Ssh, Ssl, TestConnection } from "re";

import { MySQLConnectionProvider } from "./MySQLConnectionProvider";
import { MySQLFamilyDBConnectionTester } from "../MySQLFamilyDBConnectionTester";
import { MySQLFamilyMessagePrettier } from "../MySQLFamilyMessagePrettier";
import { MySQLSshConnectionProvider } from "./MySQLSshConnectionProvider";

export class MySQLTestConnection implements TestConnection {
  public constructor(
    private server: string,
    private user: string,
    private ssh: Ssh,
    private ssl: Ssl,
    private timeout: number,
    private password?: string,
    private infoFilename?: string
  ) {}

  public async run(): Promise<void> {
    const info = InfoFactory.create(
      this.infoFilename,
      new MySQLFamilyMessagePrettier()
    );
    try {
      const provider = (await this.ssh.provide()).host
        ? new MySQLSshConnectionProvider(
            this.ssh,
            this.ssl,
            this.server,
            this.user,
            this.timeout,
            undefined,
            this.password
          )
        : new MySQLConnectionProvider(
            this.ssl,
            this.server,
            this.user,
            this.timeout,
            undefined,
            this.password
          );
      const executor = new Executor(
        info,
        provider,
        new MySQLFamilyDBConnectionTester()
      );
      await executor.execute();
    } catch (error) {
      info.reportError(error, Category.CONNECTION);
    }
  }
}
