import { PgCompositeTypeRow } from "./PgCompositeTypeRow";
import { PgRE } from "./PgRE";

export class PgCompositeTypeRE extends PgRE<PgCompositeTypeRow> {
  public async reverse(): Promise<PgCompositeTypeRow[]> {
    return (
      await this.connection.query(
        `select       
                pg_get_userbyid(t.typowner) _owner,
                ns.nspname _schema,
                t.typname _name,
                obj_description(t.oid) _comment,
                array_to_json(
                    array_agg(
                        case when att.attname is not null then 
                            jsonb_build_object('name', att.attname) 
                                || jsonb_build_object('datatype', format_type(att.atttypid , att.atttypmod)) 
                                || jsonb_build_object('comment', col_description(c."oid" , att.attnum))
                        else 
                            null 
                        end order by att.attnum)
                ) _columns               
            from
                pg_type t
                    join pg_attribute att on
                        t.typrelid = att.attrelid and att.attnum > 0 and not att.attisdropped
                    join pg_namespace ns on
                        t.typnamespace = ns.oid
                    join pg_class c on
                        c.oid = t.typrelid
            where
                ns.nspname = $1 and t.typtype = 'c' and c.relkind = 'c'
            group by
                t.typowner,
                ns.nspname,
                t.typname,
                t.oid,
                t.typtype,
                t.typbasetype,
                t.typtypmod,
                c.relkind;`,
        [this.schema]
      )
    ).rows;
  }
}
