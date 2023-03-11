import { QueryResultRow } from "./QueryResultRow";

export interface SQLiteFKRow extends QueryResultRow {
    id: string;
    seq: number;
    table: string;
    from: string;
    to: string;
    on_update: string;
    on_delete: string;
    match: string;
}
