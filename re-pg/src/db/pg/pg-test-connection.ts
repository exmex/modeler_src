import { Category, Executor, InfoFactory, Ssh, Ssl } from "re";

import { PgConnectionProvider } from "./PgConnectionProvider";
import { PgConnectionTester } from "./PgConnectionTester";
import { PgMessagePrettier } from "./PgMessagePrettier";
import { PgSshConnectionProvider } from "./pg-ssh-connection-provider";

export class PgTestConnection {
  public constructor(
    private server: string,
    private database: string,
    private user: string,
    private ssh: Ssh,
    private ssl: Ssl,
    private password?: string,
    private infoFilename?: string
  ) {}

  public async run(): Promise<void> {
    const info = InfoFactory.create(this.infoFilename, new PgMessagePrettier());
    try {
      const provider = (await this.ssh.provide()).host
        ? new PgSshConnectionProvider(
            this.ssh,
            this.ssl,
            this.server,
            this.user,
            this.password,
            this.database,
            undefined
          )
        : new PgConnectionProvider(
            this.ssl,
            this.server,
            this.user,
            this.password,
            this.database,
            undefined
          );
      const executor = new Executor(info, provider, new PgConnectionTester());
      await executor.execute();
    } catch (error) {
      info.reportError(error, Category.CONNECTION);
    }
  }
}
