import {
  ConnectionProvider,
  ForwardedUrlBuilder,
  SQLHandledConnection,
  Ssh,
  SshSQLHandledConnection,
  SshTunnel,
  Ssl
} from "re";

import { MSSQLConnectionProvider } from "./MSSQLConnectionProvider";
import { MSSQLFeatures } from "../../reverse/mssql/MSSQLFeatures";
import { Server } from "net";
import { URL } from "url";

export class MSSQLSshConnectionProvider
  implements
    ConnectionProvider<MSSQLFeatures, SQLHandledConnection<MSSQLFeatures>>
{
  public constructor(
    private ssh: Ssh,
    private ssl: Ssl,
    private host: string,
    private port: number,
    private user: string,
    private encrypt: boolean,
    private trustServerCertificate: boolean,
    private password: string | undefined,
    private database: string | undefined
  ) {}

  public async createConnection(
    hint: string
  ): Promise<SQLHandledConnection<MSSQLFeatures>> {
    const tunnelUrl = new URL(`http://${this.host}:${this.port}`);
    const tunnel = new SshTunnel<
      MSSQLFeatures,
      SQLHandledConnection<MSSQLFeatures>
    >(
      new ForwardedUrlBuilder(),
      tunnelUrl,
      this.ssh,
      (
        sshTunneledServer: string
      ): ConnectionProvider<
        MSSQLFeatures,
        SQLHandledConnection<MSSQLFeatures>
      > => {
        const sshTunneledServerURL = new URL(sshTunneledServer);
        this.logSshTunnelServer(sshTunneledServerURL);
        return new MSSQLConnectionProvider(
          this.ssl,
          sshTunneledServerURL.hostname,
          +sshTunneledServerURL.port,
          this.user,
          this.encrypt,
          this.trustServerCertificate,
          this.password,
          this.database
        );
      },
      (
        handledConnection: SQLHandledConnection<MSSQLFeatures>,
        server: Server
      ) => {
        return new SshSQLHandledConnection(handledConnection, server);
      }
    );
    return tunnel.createConnection(hint);
  }

  private logSshTunnelServer(sshTunneledServerURL: URL) {
    console.log(`${sshTunneledServerURL.host}:${sshTunneledServerURL.port}`);
  }
}
