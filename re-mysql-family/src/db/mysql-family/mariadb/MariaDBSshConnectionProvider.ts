import {
  ConnectionProvider,
  ForwardedUrlBuilder,
  SQLHandledConnection,
  Ssh,
  SshSQLHandledConnection,
  SshTunnel,
  Ssl
} from "re";

import { MariaDBConnectionProvider } from "./MariaDBConnectionProvider";
import { MariaDBFeatures } from "../../../reverse/mysql-family/mariadb/MariaDBFeatures";
import { Server } from "net";
import { URL } from "url";

export class MariaDBSshConnectionProvider
  implements
    ConnectionProvider<MariaDBFeatures, SQLHandledConnection<MariaDBFeatures>>
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
  ): Promise<SQLHandledConnection<MariaDBFeatures>> {
    const url = new URL(`http://${this.server}`);
    const tunnel = new SshTunnel<
      MariaDBFeatures,
      SQLHandledConnection<MariaDBFeatures>
    >(
      new ForwardedUrlBuilder(),
      url,
      this.ssh,
      (
        sshTunneledServer: string
      ): ConnectionProvider<
        MariaDBFeatures,
        SQLHandledConnection<MariaDBFeatures>
      > => {
        const sshTunneledServerURL = new URL(sshTunneledServer);
        return new MariaDBConnectionProvider(
          this.ssl,
          `${sshTunneledServerURL.host}`,
          this.user,
          this.timeout,
          this.database,
          this.password
        );
      },
      (
        handledConnection: SQLHandledConnection<MariaDBFeatures>,
        server: Server
      ) => {
        return new SshSQLHandledConnection(handledConnection, server);
      }
    );
    return tunnel.createConnection(hint);
  }
}
