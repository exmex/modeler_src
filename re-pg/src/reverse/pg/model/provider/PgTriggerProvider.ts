import { KnownIdRegistry } from "re";
import { OtherObject } from "common";
import { PgFeatures } from "../../PgFeatures";
import { PgQuotation } from "../../../../db/pg/pg-quotation";
import { PgTriggerMetadata } from "../metadata/PgTriggerMetadata";
import { SQLHandledConnection } from "re";
import { SourceGenerator } from "../generator/SourceGenerator";
import { SourceProvider } from "./SourceProvider";

export class PgTriggerProvider extends SourceProvider<PgTriggerMetadata> {
  public constructor(
    connection: SQLHandledConnection<PgFeatures>,
    generator: SourceGenerator<PgTriggerMetadata>,
    knownIdRegistry: KnownIdRegistry,
    private quotation: PgQuotation,
    private schema: string
  ) {
    super(connection, generator, knownIdRegistry);
    this.schema = schema;
  }

  protected createObject(object: PgTriggerMetadata): OtherObject {
    const schema = object._schema;
    const name = object._name;
    const tablename = object._tablename;
    const type = "Trigger";
    const id = this.knownIdRegistry.getPgTriggerId(schema, name, tablename);
    return {
      id,
      visible: true,
      name: object._name,
      desc: object._comment ? object._comment : "",
      type,
      code: object._code,
      lines: [],
      pg: {
        owner: object._owner,
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
    return (
      `select\n` +
      `   n.nspname _schema,\n` +
      `   p.tgname _name,\n` +
      `   c.relname _tablename,\n` +
      `   pg_get_triggerdef(p.oid) _code,\n` +
      `   obj_description(p.oid) _comment\n` +
      `from\n` +
      `   pg_trigger p\n` +
      `join pg_class c on\n` +
      `   p.tgrelid = c.oid\n` +
      `join pg_catalog.pg_namespace n on\n` +
      `   n.oid = c.relnamespace\n` +
      `where n.nspname = $1\n` +
      `   and p.tgname not like 'RI_ConstraintTrigger_%'`
    );
  }

  protected getParameters(): any {
    return [this.schema];
  }

  protected getName(metadata: PgTriggerMetadata): string {
    return `${this.quotation.quoteIdentifier(
      metadata._schema
    )}.${this.quotation.quoteIdentifier(
      metadata._tablename
    )}.${this.quotation.quoteIdentifier(metadata._name)}`;
  }
}
