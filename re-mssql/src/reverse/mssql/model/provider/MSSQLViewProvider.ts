import { KnownIdRegistry } from "re";
import { MSSQLFeatures } from "../../MSSQLFeatures";
import { OtherObject } from "common";
import { SQLHandledConnection } from "re";
import { SourceGenerator } from "../generator/SourceGenerator";
import { SourceMetadata } from "./SourceMetadata";
import { SourceProvider } from "./SourceProvider";

export class MSSQLViewProvider extends SourceProvider<SourceMetadata> {
  public constructor(
    connection: SQLHandledConnection<MSSQLFeatures>,
    generator: SourceGenerator<SourceMetadata>,
    knownIdRegistry: KnownIdRegistry
  ) {
    super(connection, generator, knownIdRegistry);
  }

  protected createObject(object: SourceMetadata): OtherObject {
    const schema = object._schema;
    const name = object._name;
    const type = "View";
    const id = this.knownIdRegistry.getOtherObjectId(schema, name, type);
    return {
      code: object._code,
      id,
      name,
      desc: object._comment ? object._comment : "",
      lines: [],
      type,
      visible: true,
      mssql: { schema },
      generate: true,
      generateCustomCode: true
    };
  }

  protected getQuery(): string {
    return `SELECT 
    SCHEMA_NAME(uid) _schema, 
    so.name _name, 
    STRING_AGG(CAST(sc.text as nvarchar(MAX)), '') WITHIN GROUP (ORDER BY colid) _code,
    p.value _comment
  FROM 
    sys.sysobjects so 
    inner join sys.syscomments sc on sc.id = so.id
    LEFT JOIN sys.extended_properties AS p ON p.major_id=sc.id AND p.class=1
  WHERE xtype = 'V'  
  GROUP BY SCHEMA_NAME(uid), so.name, p.value`;
  }

  protected getParameters(): any[] {
    return [];
  }

  protected convertResult(queryResultRaw: any[]): SourceMetadata[] {
    return [...queryResultRaw];
  }
}
