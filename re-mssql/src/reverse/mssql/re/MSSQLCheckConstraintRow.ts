import { QueryResultRow } from "./QueryResultRow";

export interface MSSQLCheckConstraintRow extends QueryResultRow {
  _name: string;
  _schema: string;
  _table: string;
  _column: string;
  _definition: string;
  _principal: string;
  _type: string;
  _type_desc: string;
  _create_date: string;
  _modify_date: string;
  _is_ms_shipped: number;
  _is_published: number;
  _is_schema_published: number;
  _is_disabled: number;
  _is_not_for_replication: number;
  _is_not_trusted: number;
  _uses_database_collation: string;
  _is_system_named: number;
}
