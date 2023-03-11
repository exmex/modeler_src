import { ReverseOptions, SQLHandledConnection } from "re";

import { KnownIdRegistry } from "re";
import { OtherObject } from "common";
import { PgFeatures } from "../../PgFeatures";
import { PgIdentifierParser } from "../../../../db/pg/pg-identifier-parser";
import { PgTypeMetadata } from "../metadata/PgTypeMetadata";
import { PgUserDataTypeRegistry } from "../../PgUserDataTypeRegistry";
import { SourceGenerator } from "../generator/SourceGenerator";
import { SourceMetadata } from "./SourceMetadata";
import { SourceProvider } from "./SourceProvider";

export class PgTypeProvider extends SourceProvider<PgTypeMetadata> {
  public constructor(
    connection: SQLHandledConnection<PgFeatures>,
    generator: SourceGenerator<SourceMetadata>,
    knownIdRegistry: KnownIdRegistry,
    private schema: string,
    private userDataTypeRegistry: PgUserDataTypeRegistry,
    private identifierParser: PgIdentifierParser,
    private reverseOptions: ReverseOptions
  ) {
    super(connection, generator, knownIdRegistry);
    this.schema = schema;
    this.userDataTypeRegistry = userDataTypeRegistry;
    this.identifierParser = identifierParser;
    this.reverseOptions = reverseOptions;
  }

  protected createObject(object: PgTypeMetadata): OtherObject {
    const schema = object._schema;
    const name = object._name;
    const type =
      object._type.typeoftype === "e"
        ? "Enum"
        : object._type.typeoftype === "d"
        ? "Domain"
        : "TypeOther";
    const id = this.knownIdRegistry.getOtherObjectId(schema, name, type);
    this.userDataTypeRegistry.register(
      { name: object._name, scope: object._schema },
      id
    );

    return {
      ...this.default(),
      id,
      name: object._name,
      desc: object._comment ? object._comment : "",
      code: object._code,
      pg: {
        owner: object._owner,
        schema:
          this.reverseOptions.includeSchema === true ? object._schema : ``,
        type: this.type(object._type.typeoftype)
      },
      ...this.enumDetails(object),
      ...this.domainDetails(object)
    };
  }

  private type(typeoftype: string) {
    switch (typeoftype) {
      case "b":
        return "base";
      case "r":
        return "range";
      case "c":
        return "composite";
      case "d":
        return "domain";
      case "e":
        return "enum";
      case "p":
        return "pseudo";
      default:
        return "none";
    }
  }

  private domainDetails(object: PgTypeMetadata) {
    if (object._type.typeoftype === "d") {
      const schema =
        this.reverseOptions.includeSchema === true ? object._schema : ``;
      return {
        type: "Domain",
        generate: true,
        generateCustomCode: true,
        pg: {
          owner: object._owner,
          schema,
          domain: {
            not_null: object._type.notnull,
            constraints: object._type.constraints
              ? (object._type.constraints as any).map((con: any) => ({
                  ...con,
                  id: this.knownIdRegistry.getDomainConstraintId(
                    schema,
                    object._name,
                    con.name
                  )
                }))
              : null,
            collation:
              object._type.collation && object._type.collation !== "default"
                ? object._type.collation
                : undefined,
            default: object._type.default ? object._type.default : undefined,
            datatype: this.getTypeName(object._type.type),
            datatype_param: this.getParamName(object._type.type)
          }
        }
      };
    }
    return {};
  }

  private getTypeName(datatype: string): string {
    const lbpos = datatype.indexOf("(");
    if (lbpos > 0) {
      return datatype.split("(")[0].trim();
    }
    const datatypename = datatype.replace("[]", "");
    const parsedId = this.identifierParser.parseIdentifier(
      datatypename,
      undefined
    );
    if (parsedId) {
      return parsedId.name;
    }
    return datatypename;
  }

  private getParamName(datatype: string) {
    const lbpos = datatype.indexOf("(");
    const rbpos = datatype.indexOf(")");

    if (lbpos > 0) {
      return datatype.substring(lbpos + 1, rbpos);
    }

    return "";
  }

  private enumDetails(object: PgTypeMetadata) {
    if (object._type.typeoftype === "e") {
      return {
        type: "Enum",
        enumValues: object._type.enum
          ? object._type.enum.map((item) => `'${item}'`).join(",\n")
          : ""
      };
    }
    return {};
  }

  private default(): any {
    return {
      visible: true,
      lines: [],
      type: "TypeOther",
      generate: true,
      generateCustomCode: true
    };
  }

  protected getQuery(): string {
    return `select
        pg_get_userbyid(t.typowner) _owner,
         ns.nspname _schema,
        t.typname _name,
        obj_description(r.rngtypid) _comment,
        jsonb_build_object('typeoftype', 'r')
        || jsonb_build_object('subtype', st.typname) 
        ||
        case
            when n.oid is null then '{}'
            else jsonb_build_object('collation_schema', n.nspname) 
        end 
        || jsonb_build_object('collation', col.collname) 
        || jsonb_build_object('subtype_opclass', opc.opcname) 
        || jsonb_build_object('canonical', r.rngcanonical)
        || jsonb_build_object('subtype_diff', r.rngsubdiff) _type
        from
            pg_range r
                left join pg_type st on
                    st.oid = r.rngsubtype
                left join pg_type t on
                    t.oid = r.rngtypid
                left join pg_namespace ns on
                    t.typnamespace = ns."oid"
                left join pg_collation col on
                    col.oid = r.rngcollation
                left join pg_namespace n on
                    col.collnamespace = n.oid
                left join pg_opclass opc on
                    opc.oid = rngsubopc
                where
                    ns.nspname = $1
    union
    select
        pg_get_userbyid(t.typowner) _owner,
        ns.nspname _schema,
        t.typname _name,
        obj_description(t.oid) _comment,
        jsonb_build_object('typeoftype', t.typtype) 
        || jsonb_build_object('type', format_type(t.typbasetype, t.typtypmod))         
        || jsonb_build_object('input', t.typinput ) 
        || jsonb_build_object('output', t.typoutput ) 
        || jsonb_build_object('receive', t.typreceive ) 
        || jsonb_build_object('send', t.typsend ) 
        || jsonb_build_object('typmod_id', t.typmodin ) 
        || jsonb_build_object('typmod_out', t.typmodout ) 
        || jsonb_build_object('analyze', t.typanalyze ) 
        || jsonb_build_object('internallength', t.typlen ) 
        || jsonb_build_object('passedbyvalue', t.typbyval ) 
        || jsonb_build_object('alignment', t.typalign ) 
        || jsonb_build_object('storage', t.typstorage ) 
        || jsonb_build_object('category', t.typcategory ) 
        || jsonb_build_object('preferred', t.typispreferred ) 
        || jsonb_build_object('default', t.typdefault ) 
        || jsonb_build_object('element', t.typname ) 
        || jsonb_build_object('delimited', t.typdelim) 
        || jsonb_build_object('collatable', t.typcollation != 0 ) 
        || jsonb_build_object('name', t.typname )                 
        || jsonb_build_object('notnull', t.typnotnull) 
        || jsonb_build_object('constraints', 
            (select array_agg(
                jsonb_build_object('name', conname) 
                || jsonb_build_object('constraint_def', pg_catalog.pg_get_constraintdef(oid, true))) from pg_catalog.pg_constraint where contypid = t.oid))
        || jsonb_build_object('collation', 
            (select col.collname from pg_catalog.pg_collation col where t.typcollation = col.oid)) 
        || jsonb_build_object('enum', 
            (select array_agg(e.enumlabel order by e.enumsortorder) from pg_catalog.pg_enum e where e.enumtypid = t.oid)) 
    from
        pg_type t
        left join pg_namespace ns on
            t.typnamespace = ns.oid
    where
        ns.nspname = $1 and t.typtype not in ('r', 'c')
    group by
        ns.nspname,
        t.typtype,
        t.typnamespace,
        t.typname,
        t.oid,
        t.typdefault,
        t.typcollation,
        t.typinput,
        t.typoutput,
        t.typreceive,
        t.typsend,
        t.typmodin,
        t.typmodout,
        t.typanalyze,
        t.typlen,
        t.typbyval,
        t.typalign,
        t.typstorage,
        t.typcategory,
        t.typispreferred,
        t.typdefault,
        t.typname,
        t.typdelim,
        t.typcollation,
        t.typnotnull,
        t.typbasetype,
        t.typtypmod,
        t.typowner;`;
  }

  protected getParameters(): any {
    return [this.schema];
  }
}
