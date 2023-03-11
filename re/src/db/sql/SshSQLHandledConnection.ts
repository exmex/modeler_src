import { Features } from "../../reverse/common/Features";
import { Platform } from "../Platform";
import { SQLHandledConnection } from "./SQLHandledConnection";
import { Server } from "net";

export class SshSQLHandledConnection<T extends Features>
  implements SQLHandledConnection<T>
{
  public constructor(
    private handledConnection: SQLHandledConnection<T>,
    private server: Server
  ) {}

  public async getServerPlarform(): Promise<Platform> {
    return this.handledConnection.getServerPlarform();
  }

  public getFeatures(): Promise<T> {
    return this.handledConnection.getFeatures();
  }

  public getServerVersion(): Promise<string> {
    return this.handledConnection.getServerVersion();
  }

  public getServerDescription(): Promise<string> {
    return this.handledConnection.getServerDescription();
  }

  public async close(): Promise<void> {
    await this.handledConnection.close();
    await new Promise<void>((resolve, reject) =>
      this.server.close((err) => {
        if (err) {
          reject();
        }
        resolve();
      })
    );
  }

  public async query(sql: string, values?: any): Promise<any> {
    return await this.handledConnection.query(sql, values);
  }

  public async exec(sql: string, values?: any): Promise<void> {
    return await this.handledConnection.exec(sql, values);
  }
}
