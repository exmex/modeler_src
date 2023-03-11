import { QueryResultRow } from "pg";

export interface PgTableRow extends QueryResultRow {
    _owner: string;
    _schema: string;
    _table: string;
    _comment: string;
    _inherits: string;
    _tablespace: string;
    _storageparameters: string[];
}
