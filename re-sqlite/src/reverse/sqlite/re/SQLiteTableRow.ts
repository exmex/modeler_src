import { QueryResultRow } from "./QueryResultRow";

export interface SQLiteTableRow extends QueryResultRow {
  _name: string;
  _code: string;
}
