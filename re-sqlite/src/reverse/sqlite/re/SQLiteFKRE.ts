import { SQLiteFKRow } from "./SQLiteFKRow";
import { SQLiteHandledConnection } from "../../../db/sqlite/sqlite-handled-connection";

export class SQLiteFKRE {
    public constructor(protected connection: SQLiteHandledConnection) {
    }
    public async reverse(tablename: string): Promise<SQLiteFKRow[]> {
        return this.connection.query(
            `PRAGMA foreign_key_list("${tablename}")`, []);
    }
}