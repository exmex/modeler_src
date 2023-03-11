import { QueryResultRow } from "./QueryResultRow";

export interface MSSQLKeyConstraintRow extends QueryResultRow {
  _schema_name: string;
  _table_name: string;
  _constraint_name: string;
  _column_name: string;
  _is_unique: boolean;
  _is_primary_key: boolean;
  _clustered: string;
  _comment: string;
}
