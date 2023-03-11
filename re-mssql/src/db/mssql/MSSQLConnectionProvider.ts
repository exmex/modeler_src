import { ConnectionProvider, SQLHandledConnection, Ssl } from "re";
import sql, { config } from "mssql";

import { MSSQLFeatures } from "../../reverse/mssql/MSSQLFeatures";
import { MSSQLHandledConnectionImpl } from "./MSSQLHandledConnection";
import { MSSQLSslAdapter } from "./ssl/mssql-ssl-adapter";

export class MSSQLConnectionProvider
  implements
    ConnectionProvider<MSSQLFeatures, SQLHandledConnection<MSSQLFeatures>>
{
  public constructor(
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
    const sslAdapter = new MSSQLSslAdapter(this.ssl);

    // const host = url.hostname;
    // const port = url.port ? parseInt(url.port, 10) : 5432;
    //const ssl = { ...sslAdapter.provide() };

    const connProps: config = {
      user: this.user,
      password: this.password,
      ...(this.database ? { database: this.database } : {}),
      server: this.host,
      port: this.port,
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
      },
      options: {
        ...(this.encrypt === true ? { encrypt: true } : {}), // for azure
        ...(this.trustServerCertificate === true
          ? { trustServerCertificate: true }
          : { trustServerCertificate: false }) // change to true for local dev / self-signed certs
      }
    };
    const pool = await new sql.ConnectionPool(connProps).connect();
    console.log({
      [`connected-${hint}`]: (await pool.query(`SELECT @@SPID as SessionID`))
        .recordset
    });

    ///    await this.activateSelectedSchema(client);

    const handledConnection = new MSSQLHandledConnectionImpl(pool);
    await this.logServerDescription(handledConnection);
    const features = await handledConnection.getFeatures();
    const currentVersion = await handledConnection.getServerVersion();
    if (!features.isSupported()) {
      await handledConnection.close();
      throw new Error(
        `This version ${currentVersion} of server is not supported. Minimal supported version is ${features.getMinimalSupportedVersion()}.`
      );
    }
    return handledConnection;
  }

  // private async activateSelectedSchema(client: Client) {
  //   if (this.database && this.schema) {
  //     const result = (
  //       await client.query(
  //         `SELECT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = $1)`,
  //         [this.schema]
  //       )
  //     ).rows;
  //     if (result.length === 0 || result[0].exists === false) {
  //       await client.end();
  //       throw new Error(
  //         `The schema ${this.schema} doesn't exists. Please choose existing schema.`
  //       );
  //     }
  //     await client.query(`SET search_path TO '${this.schema}'`);
  //   }
  // }

  private async logServerDescription(
    handledConnection: MSSQLHandledConnectionImpl
  ) {
    console.log(await handledConnection.getServerDescription());
  }
}
