import { Platform, PlatformForHumans, SQLHandledConnection } from "re";

import { Client } from "pg";
import { PgFeatures } from "../../reverse/pg/PgFeatures";

export class PgHandledConnectionImpl
  implements SQLHandledConnection<PgFeatures>
{
  private client: Client;
  public constructor(client: Client) {
    this.client = client;
  }

  public async getServerPlarform(): Promise<Platform> {
    return Promise.resolve(Platform.PG);
  }

  public async getFeatures(): Promise<PgFeatures> {
    return new PgFeatures(await this.getServerVersion());
  }

  public async getServerVersion(): Promise<string> {
    const result = (await this.client.query(`show server_version`)).rows[0] as {
      server_version: string;
    };

    return result.server_version.split(" ")[0];
  }

  public async getServerDescription(): Promise<string> {
    const result = (await this.client.query(`show server_version`)).rows[0] as {
      server_version: string;
    };
    const platformForHumans = await this.getServerPlarform();
    const platform = PlatformForHumans[platformForHumans];
    return `${platform} ${result.server_version}`;
  }

  public async query(sql: string, values?: any): Promise<any> {
    try {
      return await this.client.query(sql, values);
    } catch (error) {
      console.log(
        `Problems with script execution: ${(error as any).message
        }\nsource:\t${await this.getServerVersion()}\n${sql}`
      );
      throw error;
    }
  }

  public exec(sql: string, values?: any): Promise<any> {
    return this.query(sql, values);
  }

  public async close(): Promise<void> {
    await this.client.end();
  }
}
