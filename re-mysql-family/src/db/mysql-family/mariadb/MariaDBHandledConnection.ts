import { Platform, PlatformForHumans, SQLHandledConnection } from "re";

import { Connection } from "mariadb";
import { MariaDBFeatures } from "../../../reverse/mysql-family/mariadb/MariaDBFeatures";
import { getMySQLFamilyPlatform } from "../MySQLFamilyUtil";

export class MariaDBHandledConnectionImpl
  implements SQLHandledConnection<MariaDBFeatures>
{
  public constructor(private readonly connection: Connection) { }

  public async getServerPlarform(): Promise<Platform> {
    const version = this.connection.serverVersion();
    return getMySQLFamilyPlatform(version);
  }

  public async isMySQLSchemaAvailable(): Promise<boolean> {
    try {
      await this.query(`select 1 from mysql.proc limit 0`);
      return true;
    } catch {
      return false;
    }
  }
  public async getFeatures(): Promise<MariaDBFeatures> {
    return new MariaDBFeatures(
      await this.getServerVersion(),
      await this.isMySQLSchemaAvailable()
    );
  }

  public async getServerVersion(): Promise<string> {
    return this.connection.serverVersion().split("-")[0];
  }

  public async getServerDescription(): Promise<string> {
    const version = this.connection.serverVersion();
    const platformKey = await this.getServerPlarform();
    const platform = PlatformForHumans[platformKey];
    return `${platform} ${version}`;
  }

  public async close(): Promise<void> {
    await this.connection.end();
  }

  public async query(sql: string, values?: any): Promise<any> {
    return this.connection.query(sql, values);
  }

  public async exec(sql: string, values?: any): Promise<any> {
    return this.query(sql, values);
  }
}
