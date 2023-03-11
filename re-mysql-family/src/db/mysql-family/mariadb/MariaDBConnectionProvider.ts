import {
  ConnectionProvider,
  Platform,
  PlatformForHumans,
  SQLHandledConnection,
  Ssl
} from "re";

import { MariaDBFamilySslAdapter } from "./ssl/mariadb-ssl-adapter";
import { MariaDBFeatures } from "../../../reverse/mysql-family/mariadb/MariaDBFeatures";
import { MariaDBHandledConnectionImpl } from "./MariaDBHandledConnection";
import { URL } from "url";
import { createConnection } from "mariadb";

export class MariaDBConnectionProvider
  implements
    ConnectionProvider<MariaDBFeatures, SQLHandledConnection<MariaDBFeatures>>
{
  public constructor(
    private ssl: Ssl,
    private server: string,
    private user: string,
    private timeout: number,
    private database: string | undefined,
    private password: string | undefined
  ) {}

  public async createConnection(): Promise<
    SQLHandledConnection<MariaDBFeatures>
  > {
    const url = new URL(`http://${this.server}`);
    const sslAdapter = new MariaDBFamilySslAdapter(this.ssl);

    const host = url.hostname;
    const port = url.port ? parseInt(url.port, 10) : 3306;

    try {
      const connectionConfig = {
        database: this.database,
        host,
        password: this.password,
        port,
        user: this.user,
        connectTimeout: this.timeout,
        socketTimeout: this.timeout,
        ...sslAdapter.provide()
      };

      const handledConnection = new MariaDBHandledConnectionImpl(
        await createConnection(connectionConfig)
      );

      const serverDescription = await handledConnection.getServerDescription();
      const platform = await handledConnection.getServerPlarform();
      console.log(serverDescription);
      if (platform !== Platform.MARIADB) {
        await handledConnection.close();
        throw new Error(
          `The server and connection type do not match. Server ${serverDescription} was detected, but the connection type was defined for ${
            PlatformForHumans[Platform.MARIADB]
          }.`
        );
      }
      const features = await handledConnection.getFeatures();
      const currentVersion = await handledConnection.getServerVersion();
      if (!features.isSupported()) {
        await handledConnection.close();
        throw new Error(
          `This version ${currentVersion} of server is not supported. Minimal supported version is ${features.getMinimalSupportedVersion()}.`
        );
      }
      return handledConnection;
    } catch (err) {
      throw new Error((err as any).message);
    }
  }
}
