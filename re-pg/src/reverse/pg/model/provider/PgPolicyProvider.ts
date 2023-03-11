import { ArrayParser } from "./ArrayParser";
import { KnownIdRegistry } from "re";
import { OtherObject } from "common";
import { PgFeatures } from "../../PgFeatures";
import { PgPolicyMetadata } from "../metadata/PgPolicyMetadata";
import { PgQuotation } from "../../../../db/pg/pg-quotation";
import { SQLHandledConnection } from "re";
import { SourceGenerator } from "../generator/SourceGenerator";
import { SourceProvider } from "./SourceProvider";

export class PgPolicyProvider extends SourceProvider<PgPolicyMetadata> {
  public constructor(
    connection: SQLHandledConnection<PgFeatures>,
    generator: SourceGenerator<PgPolicyMetadata>,
    knownIdRegistry: KnownIdRegistry,
    private schema: string,
    private quotation: PgQuotation,
    private features: PgFeatures,
    private arrayParser: ArrayParser
  ) {
    super(connection, generator, knownIdRegistry);
    this.schema = schema;
    this.quotation = quotation;
    this.features = features;
    this.arrayParser = arrayParser;
  }

  protected createObject(object: PgPolicyMetadata): OtherObject {
    const schema = object._schema;
    const name = this.getName(object);
    const type = "Policy";
    const id = this.knownIdRegistry.getOtherObjectId(schema, name, type);

    return {
      code: `${object._code}`,
      id,
      name,
      desc: object._comment ? object._comment : "",
      lines: [],
      type,
      visible: true,
      pg: {
        owner: object._owner,
        schema: object._schema,
        policy: {
          tablename: object._table_name,
          command: object._command,
          role_names: this.arrayParser.parse(object._roles),
          using_expression: object._using_expression,
          check_expression: object._check_expression,
          permissive: object._permissive
        }
      },
      generate: true,
      generateCustomCode: true
    };
  }

  protected getQuery(): string {
    return (
      `select\n` +
      `pg_get_userbyid(c.relowner) _owner,\n` +
      `schemaname _schema,\n` +
      `policyname _name,\n` +
      `tablename _table_name,\n` +
      `roles _roles,\n` +
      `cmd _command,\n` +
      `qual _using_expression,\n` +
      `with_check _check_expression,\n` +
      `${
        this.features.restrictivePolicies()
          ? `case when permissive = 'PERMISSIVE' then true else false end`
          : `true`
      } _permissive\n` +
      `from pg_catalog.pg_policies p\n` +
      `join pg_catalog.pg_namespace n on n.nspname  = p.schemaname\n` +
      `join pg_class c on c.relname = p.tablename and c.relnamespace = n."oid"\n` +
      `where schemaname = $1`
    );
  }

  protected getParameters(): any[] {
    return [this.schema];
  }

  protected getName(metadata: PgPolicyMetadata): string {
    return `${this.quotation.quoteIdentifier(
      metadata._table_name
    )}.${this.quotation.quoteIdentifier(metadata._name)}`;
  }
}
