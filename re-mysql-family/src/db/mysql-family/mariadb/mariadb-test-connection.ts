import { Category, Executor, InfoFactory, Ssh, Ssl } from "re";

import { MariaDBConnectionProvider } from "./MariaDBConnectionProvider";
import { MariaDBSshConnectionProvider } from "./MariaDBSshConnectionProvider";
import { MySQLFamilyDBConnectionTester } from "../MySQLFamilyDBConnectionTester";
import { MySQLFamilyMessagePrettier } from "../MySQLFamilyMessagePrettier";

export class MariaDBTestConnection {
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
        ? new MariaDBSshConnectionProvider(
            this.ssh,
            this.ssl,
            this.server,
            this.user,
            this.timeout,
            undefined,
            this.password
          )
        : new MariaDBConnectionProvider(
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
