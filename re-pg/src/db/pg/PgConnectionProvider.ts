import { Client, ClientConfig } from "pg";
import { ConnectionProvider, SQLHandledConnection, Ssl } from "re";

import { PgFeatures } from "../../reverse/pg/PgFeatures";
import { PgHandledConnectionImpl } from "./PgHandledConnection";
import { PgSslAdapter } from "./ssl/pg-ssl-adapter";
import { URL } from "url";

export class PgConnectionProvider
  implements ConnectionProvider<PgFeatures, SQLHandledConnection<PgFeatures>>
{
  public constructor(
    private ssl: Ssl,
    private server: string,
    private user: string,
    private password: string | undefined,
    private database: string | undefined,
    private schema: string | undefined
  ) {}

  public async createConnection(): Promise<SQLHandledConnection<PgFeatures>> {
    const url = new URL(`http://${this.server}`);
    const sslAdapter = new PgSslAdapter(this.ssl);

    const host = url.hostname;
    const port = url.port ? parseInt(url.port, 10) : 5432;
    const ssl = { ...sslAdapter.provide() };

    const clientConfig: ClientConfig = {
      host: host,
      port: port,
      user: this.user,
      database: this.database,
      password: this.password,
      ...ssl
    };

    const client = new Client(clientConfig);
    await client.connect();

    await this.activateSelectedSchema(client);

    const handledConnection = new PgHandledConnectionImpl(client);
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

  private async activateSelectedSchema(client: Client) {
    if (this.database && this.schema) {
      const result = (
        await client.query(
          `SELECT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = $1)`,
          [this.schema]
        )
      ).rows;
      if (result.length === 0 || result[0].exists === false) {
        await client.end();
        throw new Error(
          `The schema ${this.schema} doesn't exists. Please choose existing schema.`
        );
      }
      await client.query(`SET search_path TO '${this.schema}'`);
    }
  }

  private async logServerDescription(
    handledConnection: PgHandledConnectionImpl
  ) {
    console.log(await handledConnection.getServerDescription());
  }
}
