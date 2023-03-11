import BetterSqlite3 from "better-sqlite3";
import { ConnectionProvider } from "re";
import { SQLiteFeatures } from "../../reverse/sqlite/sqlite-features";
import { SQLiteHandledConnection } from "./sqlite-handled-connection";

export class SQLiteConnectionProvider
  implements ConnectionProvider<SQLiteFeatures, SQLiteHandledConnection>
{
  public constructor(private filename: string) {}

  public async createConnection(): Promise<SQLiteHandledConnection> {
    const db = new BetterSqlite3(this.filename, { fileMustExist: false });
    return new SQLiteHandledConnection(db);
  }
}
