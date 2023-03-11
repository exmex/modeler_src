import { MSSQLRE } from "./MSSQLRE";
import { MSSQLTableRow } from "./MSSQLTableRow";

export class MSSQLTableRE extends MSSQLRE<MSSQLTableRow> {
  public async reverse(): Promise<MSSQLTableRow[]> {
    return await this.connection.query(
      `select 
        schema_name(t.schema_id) _schema, 
        t.name _table,
        p.value _comment
      from sys.tables t
      LEFT JOIN sys.extended_properties AS p ON p.major_id=t.object_id AND p.class=1 and p.minor_id =0`,
      []
    );
  }
}
