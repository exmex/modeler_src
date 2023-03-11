import { QueryResultRow } from "./QueryResultRow";

export interface MSSQLTableRow extends QueryResultRow {
  _schema: string;
  _table: string;
  _comment: string;
}
