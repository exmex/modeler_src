import { QueryResultRow } from "./QueryResultRow";

export interface MSSQLForeignKeyConstraintRow extends QueryResultRow {
  _name: string;
  _parent_schema: string;
  _parent_table: string;
  _child_schema: string;
  _child_table: string;
  _parent_column: string;
  _child_column: string;
  _delete_action: string;
  _update_action: string;
  _comment: string;
}
