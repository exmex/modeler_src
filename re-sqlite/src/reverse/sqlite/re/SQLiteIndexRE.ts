import { SQLiteIndexRow } from "./SQLiteIndexRow";
import { SQLiteRE } from "./SQLiteRE";

export class SQLiteIndexRE extends SQLiteRE<SQLiteIndexRow>{

    public async reverse(): Promise<SQLiteIndexRow[]> {
        return this.connection.query(
            `select tbl_name _table, name _name, sql _code from sqlite_master where type = 'index' and _code IS NOT NULL;`, []);
    }
}