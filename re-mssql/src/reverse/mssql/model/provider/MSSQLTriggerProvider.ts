import { KnownIdRegistry } from "re";
import { MSSQLFeatures } from "../../MSSQLFeatures";
import { MSSQLQuotation } from "../../../../db/mssql/mssql-quotation";
import { MSSQLTriggerMetadata } from "../metadata/MSSQLTriggerMetadata";
import { OtherObject } from "common";
import { SQLHandledConnection } from "re";
import { SourceGenerator } from "../generator/SourceGenerator";
import { SourceProvider } from "./SourceProvider";

export class MSSQLTriggerProvider extends SourceProvider<MSSQLTriggerMetadata> {
  public constructor(
    connection: SQLHandledConnection<MSSQLFeatures>,
    generator: SourceGenerator<MSSQLTriggerMetadata>,
    knownIdRegistry: KnownIdRegistry,
    private quotation: MSSQLQuotation,
  ) {
    super(connection, generator, knownIdRegistry);
  }

  protected createObject(object: MSSQLTriggerMetadata): OtherObject {
    const schema = object._schema;
    const name = object._name;
    const tablename = object._tablename;
    const type = "Trigger";
    const id = this.knownIdRegistry.getMSSQLTriggerId(schema, name, tablename);
    return {
      id,
      visible: true,
      name: object._name,
      desc: object._comment ? object._comment : "",
      type,
      code: object._code,
      lines: [],
      mssql: {
        schema,
        trigger: {
          tablename: object._tablename
        }
      },
      generate: true,
      generateCustomCode: true
    };
  }

  protected getQuery(): string {
    return ` select
      SCHEMA_NAME(tb.schema_id) _schema,
      tb.name _tablename,
      t.name _name,
      p.value _comment,
      STRING_AGG(CAST(sc.text as nvarchar(MAX)), ', ') _code
    from sys.triggers t
    join sys.objects tb on t.parent_id  = tb.object_id
    join sys.syscomments sc on sc.id = t.object_id
    LEFT JOIN sys.extended_properties AS p ON p.major_id=sc.id AND p.class=1
  GROUP BY SCHEMA_NAME(tb.schema_id), tb.name, t.name, p.value, sc.colid
  ORDER BY sc.colid;`;
  }

  protected getParameters(): any {
    return [];
  }

  protected getName(metadata: MSSQLTriggerMetadata): string {
    return `${this.quotation.quoteIdentifier(
      metadata._schema,
      false
    )}.${this.quotation.quoteIdentifier(
      metadata._tablename,
      false
    )}.${this.quotation.quoteIdentifier(metadata._name, false)}`;
  }
}
