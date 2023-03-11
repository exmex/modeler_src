import { KnownIdRegistry } from "re";
import { OtherObject } from "common";
import { PgFeatures } from "../../PgFeatures";
import { PgRoutineMetadata } from "../metadata/PgRoutineMetadata";
import { SQLHandledConnection } from "re";
import { SourceGenerator } from "../generator/SourceGenerator";
import { SourceProvider } from "./SourceProvider";

export class PgRoutineProvider extends SourceProvider<PgRoutineMetadata> {
  private schema: string;
  public constructor(
    connection: SQLHandledConnection<PgFeatures>,
    generator: SourceGenerator<PgRoutineMetadata>,
    knownIdRegistry: KnownIdRegistry,
    schema: string
  ) {
    super(connection, generator, knownIdRegistry);
    this.schema = schema;
  }

  protected createObject(object: PgRoutineMetadata): OtherObject {
    const schema = object._schema;
    const name = object._name;
    const type = object._type;
    const id = this.knownIdRegistry.getOtherObjectId(schema, name, type);
    return {
      id,
      visible: true,
      name,
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
    return `select
        pg_get_userbyid(proowner ) _owner,
        n.nspname _schema,
        proname _name,
        CASE
           WHEN a.aggfnoid IS NULL THEN pg_get_functiondef(p.oid) 
           ELSE 
               format(E'CREATE AGGREGATE %s (\n%s\n)'
                      , (pg_identify_object('pg_proc'::regclass, aggfnoid, 0)).identity
                      , array_to_string(
                         ARRAY[
                            format(E'\tSFUNC = %s', aggtransfn::regproc)
                            , format(E'\tSTYPE = %s', format_type(aggtranstype, NULL))
                            , CASE aggfinalfn WHEN '-'::regproc THEN NULL ELSE format(E'\tFINALFUNC = %s',aggfinalfn::text) END
                            , CASE aggsortop WHEN 0 THEN NULL ELSE format(E'\tSORTOP = %s', oprname) END
                            , CASE WHEN agginitval IS NULL THEN NULL ELSE format(E'\tINITCOND = %s', agginitval) END
                         ]
                     , E',\n'
                      )
               )
         END _code,
           obj_description(p.oid) _comment,
        case
            when pg_get_function_result(p."oid" ) is null then 'Procedure'
            else 'Function' end _type
        from
           pg_proc  p
        join pg_namespace n on
            p.pronamespace = n.oid 
        left join pg_aggregate a on
           a.aggfnoid = p.oid
        left join pg_operator o ON o.oid = a.aggsortop
        where
            nspname = $1`;
  }

  protected getParameters(): any {
    return [this.schema];
  }
}
