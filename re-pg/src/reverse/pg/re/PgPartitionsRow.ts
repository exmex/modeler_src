import { QueryResultRow } from "pg";

export interface PgPartitionsRow extends QueryResultRow {
    _table_schema: string;
    _table_name: string;
    _columns: string;
    _partition_type: string;
    _parent_table_schema: string;
    _parent_table_name: string;
    _partitioning_values: string;
    _sub_partitioning_values: string;
    _table_options: string[];
    _table_tablespace: string;
}
