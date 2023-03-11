import { MSSQLKeyConstraintRow } from "./MSSQLKeyConstraintRow";
import { MSSQLRE } from "./MSSQLRE";

export class MSSQLKeyConstraintRE extends MSSQLRE<MSSQLKeyConstraintRow> {
  public async reverse(): Promise<MSSQLKeyConstraintRow[]> {
    return await this.connection.query(
      `select 
        schema_name(tab.schema_id) _schema_name, 
        tab.[name] _table_name,
        pk.[name] _constraint_name,
        col.[name] _column_name, 
        pk.is_unique _is_unique,
        pk.is_primary_key _is_primary_key,
        pk.type_desc _clustered
    from sys.tables tab
        inner join sys.indexes pk
            on tab.object_id = pk.object_id 
        inner join sys.index_columns ic
            on ic.object_id = pk.object_id
            and ic.index_id = pk.index_id
        inner join sys.columns col
            on pk.object_id = col.object_id
            and col.column_id = ic.column_id
    where (pk.is_unique_constraint = 1 or pk.is_primary_key = 1)
    order by 
      schema_name(tab.schema_id),
        pk.[name],
        ic.index_column_id
        `,
      []
    );
  }
}
