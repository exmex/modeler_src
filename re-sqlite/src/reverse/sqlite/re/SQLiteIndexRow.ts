import { QueryResultRow } from "./QueryResultRow";

export interface SQLiteIndexRow extends QueryResultRow {
    _table: string,
    _name: string,
    _code: string,
}
