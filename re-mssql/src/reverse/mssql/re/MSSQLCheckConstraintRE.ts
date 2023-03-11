import { MSSQLCheckConstraintRow } from "./MSSQLCheckConstraintRow";
import { MSSQLRE } from "./MSSQLRE";
import sql from "mssql";

export class MSSQLCheckConstraintRE extends MSSQLRE<MSSQLCheckConstraintRow> {
  public async reverse(): Promise<MSSQLCheckConstraintRow[]> {
    return await this.connection.query(
      `select 
        cc.name _name, 
        SCHEMA_NAME(cc.schema_id) _schema, 
        ao.name _table, 
        ac.name _column,
        cc.definition _definition,
        schema_name(cc.principal_id) _principal,
        cc.type _type,
        cc.type_desc _type_desc,
        cc.create_date _create_date,
        cc.modify_date _modify_date,            
        cc.is_ms_shipped _is_ms_shipped,
        cc.is_published _is_published,           
        cc.is_schema_published _is_schema_published,    
        cc.is_disabled _is_disabled,            
        cc.is_not_for_replication _is_not_for_replication,
        cc.is_not_trusted _is_not_trusted,         
        cc.uses_database_collation _uses_database_collation,
        cc.is_system_named _is_system_named,
        p.value _comment
      from sys.check_constraints cc
      join sys.all_objects ao on ao.object_id = cc.parent_object_id
      left join sys.all_columns ac on ac.object_id = cc.parent_object_id and cc.parent_column_id = ac.column_id
      LEFT JOIN sys.extended_properties AS p ON p.major_id=cc.object_id AND p.class=1 and p.minor_id =0`,
      []
    );
  }
}
