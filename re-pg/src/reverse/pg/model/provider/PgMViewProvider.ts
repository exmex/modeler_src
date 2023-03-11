import { KnownIdRegistry } from "re";
import { OtherObject } from "common";
import { PgFeatures } from "../../PgFeatures";
import { PgMViewMetadata } from "../metadata/PgMViewMetadata";
import { PgMViewSourceGenerator } from "../generator/PgMViewSourceGenerator";
import { SQLHandledConnection } from "re";
import { SourceProvider } from "./SourceProvider";

export class PgMViewProvider extends SourceProvider<PgMViewMetadata> {
  public constructor(
    connection: SQLHandledConnection<PgFeatures>,
    generator: PgMViewSourceGenerator,
    knownIdRegistry: KnownIdRegistry,
    private schema: string
  ) {
    super(connection, generator, knownIdRegistry);
  }

  protected createObject(object: PgMViewMetadata): OtherObject {
    const schema = object._schema;
    const name = object._name;
    const type = "MaterializedView";
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
        obj_description(c.oid) _comment,
        case
            when c.reloptions is null then '{}'            
            else c.reloptions end _storageparameters,
            c.relispopulated  _withdata,
            t.spcname _tablespace
        from
            pg_catalog.pg_class c
        left join pg_catalog.pg_namespace n on
            (n.oid = c.relnamespace)
        left join pg_catalog.pg_tablespace t on
            (c.reltablespace = t.oid )
        where
            c.relkind = 'm'
            and n.nspname = $1`;
  }

  protected getParameters(): any[] {
    return [this.schema];
  }

  protected convertResult(result: any[]): PgMViewMetadata[] {
    return result.map((item) => ({
      ...item,
      _tablespace: item._tablespace,
      _withata: item._withdata,
      _storageparameters: item._storageparameters
    }));
  }
}
