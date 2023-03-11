import { Category, Executor, InfoFactory, Ssh } from "re";

import { Auth } from "./auth";
import { MongoDBConnectionProvider } from "./MongoDBConnectionProvider";
import { MongoDBConnectionTester } from "./MongoDBConnectionTester";
import { MongoDBMessagePrettier } from "./MongoDBMessagePrettier";
import { MongoDBSshConnectionProvider } from "./MongoDBSshConnectionProvider";
import { MongoDBTls } from "./tls/mongodb-tls";

export class MongoDBTestConnection {
  public constructor(
    private server: string,
    private timeout: number,
    private directConnection: boolean,
    private retryWrites: boolean,
    private ssh: Ssh,
    private tls: MongoDBTls,
    private auth: Auth,
    private infoFilename?: string
  ) {}

  public async run(): Promise<void> {
    const info = InfoFactory.create(
      this.infoFilename,
      new MongoDBMessagePrettier()
    );
    try {
      const sshParameters = await this.ssh.provide();
      const provider = sshParameters.host
        ? new MongoDBSshConnectionProvider(
            this.ssh,
            this.tls,
            this.server,
            this.timeout,
            this.directConnection,
            this.retryWrites,
            this.auth,
            ""
          )
        : new MongoDBConnectionProvider(
            this.tls,
            this.server,
            this.timeout,
            this.directConnection,
            this.retryWrites,
            this.auth,
            ""
          );
      const executor = new Executor(
        info,
        provider,
        new MongoDBConnectionTester()
      );
      await executor.execute();
    } catch (error) {
      info.reportError(error, Category.CONNECTION);
    }
  }
}
