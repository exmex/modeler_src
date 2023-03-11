import { Platform, PlatformForHumans, SQLHandledConnection } from "re";

import { Connection } from "mysql2";
import { MySQLFeatures } from "../../../reverse/mysql-family/mysql/MySQLFeatures";
import { getMySQLFamilyPlatform } from "../MySQLFamilyUtil";

export class MySQLHandledConnectionImpl
  implements SQLHandledConnection<MySQLFeatures>
{
  public constructor(private readonly connection: Connection) { }

  public async getServerPlarform(): Promise<Platform> {
    const version = await this.query("select version() version");
    return getMySQLFamilyPlatform(version[0].version);
  }

  public async isMySQLSchemaAvailable(): Promise<boolean> {
    try {
      await this.query(`select 1 from mysql.proc limit 0`);
      return true;
    } catch {
      return false;
    }
  }

  public async getFeatures(): Promise<MySQLFeatures> {
    return new MySQLFeatures(
      await this.getServerVersion(),
      await this.isMySQLSchemaAvailable()
    );
  }

  public async getServerVersion(): Promise<string> {
    const results = await this.query("select version() version");
    return results[0].version;
  }

  public async getServerDescription(): Promise<string> {
    const versionResult = await this.query("select version() version");
    const version = versionResult[0].version;
    const platformKey = await this.getServerPlarform();
    const platform = PlatformForHumans[platformKey];
    return `${platform} ${version}`;
  }

  public async close(): Promise<void> {
    return new Promise<void>((resolve, reject) =>
      this.connection.end((err) => {
        if (err) {
          reject(err);
        }
        resolve();
      })
    );
  }

  public async query(sql: string, values?: any): Promise<any> {
    return new Promise<any>((res, rej) =>
      this.connection.query(sql, values, (e, results, fields) => {
        if (e) {
          this.logFailedSql(sql);
          rej(e);
        }
        res(results);
      })
    );
  }

  public async exec(sql: string, values?: any): Promise<any> {
    return this.query(sql, values);
  }

  private logFailedSql(sql: string) {
    console.log(`Failed SQL command:`);
    console.log(sql);
  }
}
