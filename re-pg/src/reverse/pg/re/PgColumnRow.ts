import { QueryResultRow } from "pg";

export interface PgColumnRow extends QueryResultRow {
    _schema: string;
    _table: string;
    _name: string;
    _datatype: string;
    _dimensions: number;
    _notnull: boolean;
    _collation: string;
    _comment: string;
    _defaultvalue: string;
    _generated: boolean;
    _generatedidentity: string;
}
