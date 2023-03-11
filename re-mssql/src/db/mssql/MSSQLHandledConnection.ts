import { Platform, PlatformForHumans, SQLHandledConnection } from "re";
import _, { split } from "lodash";

import { ConnectionPool } from "mssql";
import { MSSQLFeatures } from "../../reverse/mssql/MSSQLFeatures";

export class MSSQLHandledConnectionImpl
  implements SQLHandledConnection<MSSQLFeatures>
{
  public constructor(private pool: ConnectionPool) {}

  public async getServerPlarform(): Promise<Platform> {
    return Promise.resolve(Platform.MSSQL);
  }

  public async getFeatures(): Promise<MSSQLFeatures> {
    return new MSSQLFeatures(await this.getServerVersion());
  }

  public async getServerVersion(): Promise<string> {
    const result = await this.query(
      `select CONVERT(VARCHAR(128), SERVERPROPERTY ('productversion')) as version`
    );

    const major = result?.[0]?.version?.split(".")?.[0] ?? 16;
    const minor = result?.[0]?.version?.split(".")?.[1] ?? 0;
    const patch = result?.[0]?.version?.split(".")?.[2] ?? 0;

    return `${major}.${minor}.${patch}`;
  }

  public async getServerDescription(): Promise<string> {
    const result = await this.query(`select @@version as server`);
    return Promise.resolve(result?.[0]?.server);
  }

  public async query(sql: string, values?: any): Promise<any> {
    try {
      let request = await this.pool.request();
      _.forEach(values, (input) => {
        request = request.input(input.name, input.type, input.value);
      });
      const result = await request.query(sql);
      return result.recordset;
    } catch (error) {
      console.dir({ fail: { sql, values, error } });
      console.log(
        `Problems with script execution: ${error}\nsource:\t${await this.getServerDescription()}\n${sql}`
      );
      throw error;
    }
  }

  public async exec(sql: string, values?: any): Promise<any> {
    return await this.query(sql, values);
  }

  public async close(): Promise<void> {
    console.log({
      closing: (await this.pool.query(`SELECT @@SPID as SessionID`)).recordset
    });

    await this.pool.close();
  }
}
