import { KnownIdRegistry } from "re";
import { OtherObject } from "common";
import { PgFeatures } from "../../PgFeatures";
import { PgQuotation } from "../../../../db/pg/pg-quotation";
import { PgRuleMetadata } from "../metadata/PgRuleMetadata";
import { SQLHandledConnection } from "re";
import { SourceGenerator } from "../generator/SourceGenerator";
import { SourceMetadata } from "./SourceMetadata";
import { SourceProvider } from "./SourceProvider";

export class PgRuleProvider extends SourceProvider<PgRuleMetadata> {
  public constructor(
    connection: SQLHandledConnection<PgFeatures>,
    generator: SourceGenerator<SourceMetadata>,
    knownIdRegistry: KnownIdRegistry,
    private schema: string,
    private quotation: PgQuotation
  ) {
    super(connection, generator, knownIdRegistry);
    this.schema = schema;
    this.quotation = quotation;
  }

  protected createObject(object: PgRuleMetadata): OtherObject {
    const schema = object._schema;
    const name = this.getName(object);
    const type = "Rule";
    const id = this.knownIdRegistry.getOtherObjectId(schema, name, type);
    return {
      code: object._code,
      id,
      name,
      desc: object._comment ? object._comment : "",
      lines: [],
      type,
      visible: true,
      pg: {
        owner: object._owner,
        schema,
        rule: { tablename: object._tablename }
      },
      generate: true,
      generateCustomCode: true
    };
  }

  protected getQuery(): string {
    return (
      `select n.nspname _schema, \n` +
      `c.relname _tablename, \n` +
      `r.rulename _name, \n` +
      `obj_description(r.oid) _comment, \n` +
      `pg_get_ruledef(r.oid) _code, \n` +
      `pg_get_userbyid(c.relowner) _owner\n` +
      `from pg_rewrite r\n` +
      `join pg_class c on r.ev_class = c.oid and c.relkind  not in ('v', 'm') \n` +
      `join pg_namespace n on n.oid = c.relnamespace\n` +
      `left join pg_description d on r.oid = d.objoid\n` +
      `where n.nspname = $1`
    );
  }

  protected getParameters(): any[] {
    return [this.schema];
  }

  protected getName(metadata: PgRuleMetadata): string {
    return `${this.quotation.quoteIdentifier(
      metadata._tablename
    )}.${this.quotation.quoteIdentifier(metadata._name)}`;
  }
}
