import { Category, Executor, InfoFactory, Ssh, Ssl } from "re";

import { MSSQLConnectionProvider } from "./MSSQLConnectionProvider";
import { MSSQLConnectionTester } from "./MSSQLConnectionTester";
import { MSSQLMessagePrettier } from "./MSSQLMessagePrettier";
import { MSSQLSshConnectionProvider } from "./mssql-ssh-connection-provider";

export class MSSQLTestConnection {
  public constructor(
    private host: string,
    private port: number,
    private user: string,
    private encrypt: boolean,
    private trustServerCertificate: boolean,
    private ssh: Ssh,
    private ssl: Ssl,
    private password?: string,
    private infoFilename?: string
  ) {}

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
            undefined
          )
        : new MSSQLConnectionProvider(
            this.ssl,
            this.host,
            this.port,
            this.user,
            this.encrypt,
            this.trustServerCertificate,
            this.password,
            undefined
          );
      const executor = new Executor(
        info,
        provider,
        new MSSQLConnectionTester()
      );
      await executor.execute();
    } catch (error) {
      info.reportError(error, Category.CONNECTION);
    }
  }
}
