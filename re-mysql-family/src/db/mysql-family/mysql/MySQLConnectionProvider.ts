import { Connection, ConnectionOptions, createConnection } from "mysql2";
import { ConnectionProvider, Platform, PlatformForHumans, SQLHandledConnection, Ssl } from "re";

import { MySQLFamilySslAdapter } from "../ssl/mysql-family-ssl-adapter";
import { MySQLFeatures } from "../../../reverse/mysql-family/mysql/MySQLFeatures";
import { MySQLHandledConnectionImpl } from "./MySQLHandledConnection";
import { URL } from "url";

export class MySQLConnectionProvider
  implements
  ConnectionProvider<MySQLFeatures, SQLHandledConnection<MySQLFeatures>>
{
  public constructor(
    private ssl: Ssl,
    private server: string,
    private user: string,
    private timeout: number,
    private database: string | undefined,
    private password: string | undefined
  ) { }

  public async createConnection(): Promise<
    SQLHandledConnection<MySQLFeatures>
  > {
    const url = new URL(`http://${this.server}`);
    const mySQLFamilySslAdapter = new MySQLFamilySslAdapter(this.ssl);

    const host = url.hostname;
    const port = url.port ? parseInt(url.port, 10) : 3306;

    try {
      const connectionConfig: ConnectionOptions = {
        database: this.database,
        host,
        password: this.password,
        port,
        user: this.user,
        connectTimeout: this.timeout,
        ...mySQLFamilySslAdapter.provide(),
      };
      const connection = createConnection(connectionConfig);
      await this.connect(connection);

      const handledConnection = new MySQLHandledConnectionImpl(connection);
      const serverPlatform = await handledConnection.getServerPlarform();
      const serverDescription = await handledConnection.getServerDescription();
      console.log(serverDescription);
      if (serverPlatform !== Platform.MYSQL) {
        await handledConnection.close();
        throw new Error(
          `The server and connection type do not match. Server ${serverDescription} was detected, but the connection type was defined for ${PlatformForHumans[Platform.MYSQL]}.`
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
      throw new Error((err as Error).message);
    }
  }

  private async connect(connection: Connection) {
    await new Promise<void>((res, rej) =>
      connection.connect((e) => {
        if (e) {
          rej(e);
        }
        res();
      })
    );
  }
}
