import { MSSQLForeignKeyConstraintRow } from "./MSSQLForeignKeyConstraintRow";
import { MSSQLRE } from "./MSSQLRE";
import sql from "mssql";

export class MSSQLForeignKeyConstraintRE extends MSSQLRE<MSSQLForeignKeyConstraintRow> {
  public async reverse(): Promise<MSSQLForeignKeyConstraintRow[]> {
    return await this.connection.query(
      `SELECT 
      fk.name _name,
      SCHEMA_NAME(tr.schema_id) _parent_schema,
      tr.name _parent_table,
      SCHEMA_NAME(t.schema_id) _child_schema,
      t.name _child_table,
      ptc.name _parent_column,
      ctc.name _child_column,
      delete_referential_action_desc _delete_action,
      update_referential_action_desc _update_action,
      p.value _comment
    FROM
    sys.foreign_keys fk
    join sys.tables t on t.object_id = fk.parent_object_id
    join sys.foreign_key_columns fkc on fk.object_id=fkc.constraint_object_id and fk.object_id=fkc.constraint_object_id
    join sys.tables tr ON tr.object_id=fk.referenced_object_id
    join sys.columns ctc on t.object_id = ctc.object_id and ctc.column_id = fkc.parent_column_id
    join sys.columns ptc on tr.object_id = ptc.object_id and ptc.column_id = fkc.referenced_column_id
    left join sys.extended_properties AS p ON p.major_id=fk.object_id AND p.class = 1 and p.minor_id = 0
    ORDER BY fkc.constraint_object_id, fkc.constraint_column_id
        `,
      []
    );
  }
}
