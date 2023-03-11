import { ConnectionProvider, ForwardedUrlBuilder, Ssh, SshTunnel } from "re";

import { Auth } from "./auth";
import { MongoDBConnectionProvider } from "./MongoDBConnectionProvider";
import { MongoDBFeatures } from "./MongoDBFeatures";
import { MongoDBHandledConnection } from "./MongoDBHandledConnection";
import { MongoDBSshHandledConnection } from "./MongoDBSshHandledConnection";
import { MongoDBTls } from "./tls/mongodb-tls";
import { Server } from "net";
import { URL } from "url";

export class MongoDBSshConnectionProvider
  implements ConnectionProvider<MongoDBFeatures, MongoDBHandledConnection>
{
  public constructor(
    private ssh: Ssh,
    private tls: MongoDBTls,
    private url: string,
    private timeout: number,
    private directConnection: boolean,
    private retryWrites: boolean,
    private auth: Auth,
    private database: string
  ) {}

  public async createConnection(
    hint: string
  ): Promise<MongoDBHandledConnection> {
    const url = new URL(this.url);
    const sshTunnel = new SshTunnel<MongoDBFeatures, MongoDBHandledConnection>(
      new ForwardedUrlBuilder(),
      url,
      this.ssh,
      (
        sshTunneledServer: string
      ): ConnectionProvider<MongoDBFeatures, MongoDBHandledConnection> => {
        return new MongoDBConnectionProvider(
          this.tls,
          sshTunneledServer,
          this.timeout,
          this.directConnection,
          this.retryWrites,
          this.auth,
          this.database
        );
      },
      (handledConnection: MongoDBHandledConnection, server: Server) => {
        return new MongoDBSshHandledConnection(handledConnection, server);
      }
    );
    return await sshTunnel.createConnection(hint);
  }
}
