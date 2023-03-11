import { PgIndexRow } from "./PgIndexRow";
import { PgRE } from "./PgRE";


export class PgIndexRE extends PgRE<PgIndexRow>{

    public async reverse(): Promise<PgIndexRow[]> {
        return (await this.connection.query(
            `select
            ti.relname _table, 
            jsonb_build_object('name', c.relname) 
            || jsonb_build_object('schema', $1::text) 
            || jsonb_build_object('unique', i.indisunique) 
            || jsonb_build_object('comment', obj_description(c.oid))
            || jsonb_build_object('expression', pg_get_indexdef(c.oid))
            || jsonb_build_object('storageParameters', c.reloptions)
            || jsonb_build_object('using', am.amname)
            || case when c.reloptions is not null THEN jsonb_build_object('storageparams', c.reloptions) ELSE '{}' end
            || case when ts.spcname is not null then jsonb_build_object('tablespace', ts.spcname) else '{}' end
            || jsonb_build_object('columns',
                array_to_json( 
                array_agg(
                    jsonb_build_object('name', a.attname) 
                    || jsonb_build_object('asc', i.indoption[a.attnum-1] & 1 = 0)
                    || jsonb_build_object('desc', i.indoption[a.attnum-1] & 1 = 1)
                    || jsonb_build_object('nulls_first', i.indoption[a.attnum-1] & 2 = 2)
                    || jsonb_build_object('nulls_last', i.indoption[a.attnum-1] & 2 = 0)
                    || case when col.collname is not null then jsonb_build_object('collation', col.collname) else '{}' end
                    || case when a.attoptions is not null then jsonb_build_object('options', a.attoptions) else '{}' end
                    || case when a.attname <> pg_catalog.pg_get_indexdef(c.oid, a.attnum , true) then jsonb_build_object('expression', pg_catalog.pg_get_indexdef(c.oid, a.attnum , true)) else '{}' end
            order by a.attnum ))) _index
        from
            pg_attribute a
        join pg_class c on
            a.attrelid = c."oid"
        join pg_index i on
            i.indexrelid = c."oid"
        join pg_class ti on
            i.indrelid = ti.oid
        left join pg_collation col on
            col.oid = a.attcollation
        left join pg_tablespace ts on
            ts.oid = c.reltablespace 
        join pg_namespace ns on
            ns.oid = ti.relnamespace
        join pg_opclass o on 
        	o.oid = all(i.indclass)
        join pg_am am on
        	am.oid = o.opcmethod 
        where c.relkind = 'i'
            and a.attnum > 0
            and not a.attisdropped
            and ns.nspname = $1
        group by c.relname, c.reloptions, ts.spcname, i.indisunique, ti.relname,c.oid, am.amname;
        `, [this.schema])).rows;
    }
}