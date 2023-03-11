import { KnownIdRegistry } from "re";
import { OtherObject } from "common";
import { PgFeatures } from "../../PgFeatures";
import { SQLHandledConnection } from "re";
import { SourceGenerator } from "../generator/SourceGenerator";
import { SourceMetadata } from "./SourceMetadata";
import { SourceProvider } from "./SourceProvider";

export class PgViewProvider extends SourceProvider<SourceMetadata> {
  public constructor(
    connection: SQLHandledConnection<PgFeatures>,
    generator: SourceGenerator<SourceMetadata>,
    knownIdRegistry: KnownIdRegistry,
    private schema: string
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
      pg: { owner: object._owner, schema },
      generate: true,
      generateCustomCode: true
    };
  }

  protected getQuery(): string {
    return `select
        pg_get_userbyid(c.relowner) _owner,
        n.nspname as _schema,
     c.relname as _name,
        pg_get_viewdef(c.oid) _code,
        obj_description(c.oid) _comment
    from
        pg_catalog.pg_class c
    left join pg_catalog.pg_namespace n on
        (n.oid = c.relnamespace)
    where
        c.relkind = 'v' and n.nspname = $1`;
  }

  protected getParameters(): any[] {
    return [this.schema];
  }
}
