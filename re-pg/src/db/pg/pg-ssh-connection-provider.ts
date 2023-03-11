import {
  ConnectionProvider,
  ForwardedUrlBuilder,
  SQLHandledConnection,
  Ssh,
  SshSQLHandledConnection,
  SshTunnel,
  Ssl
} from "re";

import { PgConnectionProvider } from "./PgConnectionProvider";
import { PgFeatures } from "../../reverse/pg/PgFeatures";
import { Server } from "net";
import { URL } from "url";

export class PgSshConnectionProvider
  implements ConnectionProvider<PgFeatures, SQLHandledConnection<PgFeatures>>
{
  public constructor(
    private ssh: Ssh,
    private ssl: Ssl,
    private server: string,
    private user: string,
    private password: string | undefined,
    private database: string | undefined,
    private schema: string | undefined
  ) {}

  public async createConnection(
    hint: string
  ): Promise<SQLHandledConnection<PgFeatures>> {
    const url = new URL(`http://${this.server}`);
    const tunnel = new SshTunnel<PgFeatures, SQLHandledConnection<PgFeatures>>(
      new ForwardedUrlBuilder(),
      url,
      this.ssh,
      (
        sshTunneledServer: string
      ): ConnectionProvider<PgFeatures, SQLHandledConnection<PgFeatures>> => {
        const sshTunneledServerURL = new URL(sshTunneledServer);
        this.logSshTunnelServer(sshTunneledServerURL);
        return new PgConnectionProvider(
          this.ssl,
          `${sshTunneledServerURL.host}`,
          this.user,
          this.password,
          this.database,
          this.schema
        );
      },
      (handledConnection: SQLHandledConnection<PgFeatures>, server: Server) => {
        return new SshSQLHandledConnection(handledConnection, server);
      }
    );
    return tunnel.createConnection(hint);
  }

  private logSshTunnelServer(sshTunneledServerURL: URL) {
    console.log(`${sshTunneledServerURL.host}:${sshTunneledServerURL.port}`);
  }
}
