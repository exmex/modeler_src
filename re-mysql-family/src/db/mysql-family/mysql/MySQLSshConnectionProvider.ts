import {
  ConnectionProvider,
  ForwardedUrlBuilder,
  SQLHandledConnection,
  Ssh,
  SshSQLHandledConnection,
  SshTunnel,
  Ssl
} from "re";

import { MySQLConnectionProvider } from "./MySQLConnectionProvider";
import { MySQLFeatures } from "../../../reverse/mysql-family/mysql/MySQLFeatures";
import { Server } from "net";
import { URL } from "url";

export class MySQLSshConnectionProvider
  implements
    ConnectionProvider<MySQLFeatures, SQLHandledConnection<MySQLFeatures>>
{
  public constructor(
    private ssh: Ssh,
    private ssl: Ssl,
    private server: string,
    private user: string,
    private timeout: number,
    private database: string | undefined,
    private password: string | undefined
  ) {}

  public async createConnection(
    hint: string
  ): Promise<SQLHandledConnection<MySQLFeatures>> {
    const url = new URL(`http://${this.server}`);
    const tunnel = new SshTunnel<
      MySQLFeatures,
      SQLHandledConnection<MySQLFeatures>
    >(
      new ForwardedUrlBuilder(),
      url,
      this.ssh,
      (
        sshTunneledServer: string
      ): ConnectionProvider<
        MySQLFeatures,
        SQLHandledConnection<MySQLFeatures>
      > => {
        const sshTunneledServerURL = new URL(sshTunneledServer);
        return new MySQLConnectionProvider(
          this.ssl,
          `${sshTunneledServerURL.host}`,
          this.user,
          this.timeout,
          this.database,
          this.password
        );
      },
      (
        handledConnection: SQLHandledConnection<MySQLFeatures>,
        server: Server
      ) => {
        return new SshSQLHandledConnection(handledConnection, server);
      }
    );
    return tunnel.createConnection(hint);
  }
}
