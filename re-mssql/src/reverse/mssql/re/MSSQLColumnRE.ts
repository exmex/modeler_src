import { MSSQLColumnRow } from "./MSSQLColumnRow";
import { MSSQLRE } from "./MSSQLRE";
export class MSSQLColumnRE extends MSSQLRE<MSSQLColumnRow> {
  public async reverse(): Promise<MSSQLColumnRow[]> {
    return await this.connection.query(
      `SELECT
      c.name _name,
    SCHEMA_NAME(t.schema_id) _schema, 
      t.name _table, 
      schema_name(tp.schema_id) _rawtype_schema,
      tp.name _rawtype,
      c.max_length,
      c.precision,
      c.scale,
      CASE 
        WHEN tp.[name] IN ('varchar', 'char', 'varbinary') THEN IIF(c.max_length = -1, 'max', CAST(c.max_length AS VARCHAR(25))) 
        WHEN tp.[name] IN ('nvarchar','nchar') THEN IIF(c.max_length = -1, 'max', CAST(c.max_length / 2 AS VARCHAR(25)))      
        WHEN tp.[name] IN ('decimal', 'numeric') THEN CAST(c.[precision] AS VARCHAR(25)) + ',' + CAST(c.[scale] AS VARCHAR(25))
        WHEN tp.[name] IN ('binary', 'varbinary' ) THEN CAST(c.[max_length] AS VARCHAR(25))
        WHEN tp.[name] IN ('datetime2', 'datetimeoffset', 'time' ) THEN CAST(c.[scale] AS VARCHAR(25))
        ELSE null
      END _param,
      dc.definition _defaultvalue,
      p.value _comment,
      tp.is_user_defined _is_user_defined,
      c.collation_name _collation_name,
      c.is_nullable _is_nullable,
      ic.seed_value _identity_seed_value,
      ic.increment_value _identity_increment_value,
      ic.is_filestream _is_filestream,
      ic.is_replicated _is_replicated,
      ic.is_not_for_replication _is_not_for_replication,
      c.is_ansi_padded _is_ansi_padded,
      c.is_rowguidcol _is_rowguidcol,
      c.is_identity _is_identity,
      c.is_computed _is_computed,
      ISNULL(cc.definition, '') _definition,
      cc.is_persisted _is_persisted, 
      c.is_filestream _is_filestream,
      c.is_replicated _is_replicated,
      c.is_non_sql_subscribed _is_non_sql_subscribed,
      c.is_merge_published _is_merge_published,
      c.is_dts_replicated _is_dts_replicated,
      c.is_xml_document _is_xml_document,
      c.xml_collection_id _xml_collection_id,
      c. default_object_id _default_object_id,
      c.rule_object_id _rule_object_id,
      c.is_sparse _is_sparse,
      c.is_column_set _is_column_set,
      c.generated_always_type _generated_always_type,
      c.generated_always_type_desc _generated_always_type_desc,
      c.encryption_type _encryption_type,
      c.encryption_type_desc _encryption_type_desc,
      c.encryption_algorithm_name _encryption_algorithm_name,
      c.column_encryption_key_id _column_encryption_key_id,
      c.column_encryption_key_database_name _column_encryption_key_database_name,
      c.is_hidden _is_hidden,
      c.is_masked _is_masked,
      c.graph_type _graph_type,
      c.graph_type_desc _graph_type_desc
  FROM sys.tables t 
  JOIN sys.schemas s ON t.schema_id = s.schema_id
  JOIN sys.columns c ON t.object_id = c.object_id
  JOIN sys.types tp ON c.user_type_id = tp.user_type_id
  LEFT JOIN sys.default_constraints dc on c.column_id = dc.parent_column_id and c.object_id = dc.parent_object_id 
  LEFT JOIN sys.computed_columns cc ON cc.object_id = c.object_id and cc.column_id = c.column_id
  LEFT JOIN sys.extended_properties AS p ON p.major_id = t.object_id and p.minor_id = c.column_id and p.class = 1
  LEFT JOIN sys.identity_columns ic on ic.object_id = c.object_id and ic.column_id = c.column_id`,
      []
    );
  }
}
