import { SQLiteRE } from "./SQLiteRE";
import { SQLiteTableRow } from "./SQLiteTableRow";

export class SQLiteTableRE extends SQLiteRE<SQLiteTableRow>{

    public async reverse(): Promise<SQLiteTableRow[]> {
        return (await this.connection.query(
            `select name _name, sql _code from sqlite_master where type = 'table'`, []));
    }
}