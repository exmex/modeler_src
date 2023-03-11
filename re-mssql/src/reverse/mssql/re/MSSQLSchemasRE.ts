import { CommonSchemaMetadata, QueryExecutor } from "re";

import { MSSQLSchemaMetadataBuilder } from "./builder/MSSQLSchemaMetadataBuilder";

const QUERY = `select s.name _schema, p.value _schema_comment from sys.schemas s left join sys.extended_properties p on s.schema_id =p.major_id and p.class = 3
where s.name not in (
'db_owner',
'db_accessadmin',
'db_securityadmin',
'db_ddladmin',
'db_backupoperator',
'db_datareader',
'db_datawriter',
'db_denydatareader',
'db_denydatawriter',
'dbo',
'guest',
'INFORMATION_SCHEMA',
'sys'
)`;
export class MSSQLSchemasRE {
  public constructor(private queryExecutor: QueryExecutor) {}

  public async reverse(): Promise<CommonSchemaMetadata[]> {
    const result = await this.queryExecutor.query(QUERY, []);
    const builder = new MSSQLSchemaMetadataBuilder(result);
    return builder.build();
  }
}
