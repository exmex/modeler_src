import { HandledConnection, Platform, QueryExecutor } from "re";

import BetterSqlite3 from "better-sqlite3";
import { SQLiteFeatures } from "../../reverse/sqlite/sqlite-features";

export class SQLiteHandledConnection
  implements HandledConnection<SQLiteFeatures>, QueryExecutor
{
  public constructor(private db: BetterSqlite3.Database) {}

  public async getServerPlarform(): Promise<Platform> {
    return Platform.SQLITE;
  }

  public getFeatures(): Promise<SQLiteFeatures> {
    return Promise.resolve(new SQLiteFeatures("0.0.0"));
  }

  public getServerDescription(): Promise<string> {
    return this.getServerVersion();
  }

  public async getServerVersion(): Promise<string> {
    return this.db.pragma(`schema_version`);
  }

  public async query(sql: string, values?: any): Promise<any> {
    const stmt = this.db.prepare(sql);
    return Promise.resolve(values ? stmt.all(values) : stmt.all());
  }

  public async exec(sql: string, values?: any): Promise<void> {
    const stmt = this.db.prepare(sql);
    Promise.resolve(values ? stmt.run(values) : stmt.run());
  }

  public async close(): Promise<void> {
    this.db.close();
  }
}
