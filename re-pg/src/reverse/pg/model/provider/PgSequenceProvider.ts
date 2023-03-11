import { KnownIdRegistry } from "re";
import { OtherObject } from "common";
import { PgFeatures } from "../../PgFeatures";
import { SQLHandledConnection } from "re";
import { SourceGenerator } from "../generator/SourceGenerator";
import { SourceMetadata } from "./SourceMetadata";
import { SourceProvider } from "./SourceProvider";

export class PgSequenceProvider extends SourceProvider<SourceMetadata> {
  public constructor(
    connection: SQLHandledConnection<PgFeatures>,
    generator: SourceGenerator<SourceMetadata>,
    knownIdRegistry: KnownIdRegistry,
    private schema: string,
    private features: PgFeatures
  ) {
    super(connection, generator, knownIdRegistry);
  }

  protected createObject(object: SourceMetadata): OtherObject {
    const schema = object._schema;
    const name = object._name;
    const type = "Sequence";
    const id = this.knownIdRegistry.getOtherObjectId(schema, name, type);
    return {
      id,
      visible: true,
      name: object._name,
      desc: object._comment ? object._comment : "",
      type,
      code: object._code,
      lines: [],
      pg: { owner: object._owner, schema },
      generate: true,
      generateCustomCode: true
    };
  }

  protected getQuery(): string {
    return `SELECT
                pg_get_userbyid(seqclass.relowner) _owner, 
                seqclass.relname AS _name,
                ns.nspname AS _schema,
                obj_description(seqclass.oid) _comment,
                seq.seqcache _cache,
                seq.seqcycle _cycle,
                seq.seqincrement _increment,
                seq.seqmax _max,
                seq.seqmin _min, 
                seq.seqstart _start
            from
                pg_sequence as seq
            join pg_class as seqclass on
                seqclass.oid = seq.seqrelid
            join pg_catalog.pg_namespace as ns on
                ns."oid" = seqclass.relnamespace
            where
                ns.nspname = $1;`;
  }

  protected getParameters(): any {
    return [this.schema];
  }

  protected isAvailable(): boolean {
    return this.features.sequences();
  }
}
