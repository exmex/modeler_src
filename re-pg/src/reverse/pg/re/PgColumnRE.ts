import { PgRE } from "./PgRE";
import { PgColumnRow } from "./PgColumnRow";

export class PgColumnRE extends PgRE<PgColumnRow>{

    public async reverse(): Promise<PgColumnRow[]> {
        return (await this.connection.query(
            `select
            n.nspname _schema,
            c.relname _table,
            a.attname _name,
            pg_catalog.format_type(a.atttypid,a.atttypmod) _datatype,
            a.attndims _dimensions,
            a.attnotnull _notnull,
            l.collname _collation,
            pg_get_expr(d.adbin,
            d.adrelid) as _defaultvalue,
            col_description(c."oid" , a.attnum) _comment,
            ${this.features.generatedColumns() ? `case when a.attgenerated='s' then true else false end` : `NULL`} _generated,
            ${this.features.generatedIdentity() ? `attidentity` : `NULL`} _generatedidentity
        from
            pg_catalog.pg_attribute a
        join pg_catalog.pg_class c on
            a.attrelid = c."oid"
        join pg_catalog.pg_type t on
            t.oid = a.atttypid
        join pg_catalog.pg_namespace n on
            n.oid = c.relnamespace
        left join pg_catalog.pg_collation l on
            l.oid = a.attcollation
        left join pg_catalog.pg_attrdef d on
            (a.attrelid,
            a.attnum) = (d.adrelid,
            d.adnum)
        where
            n.nspname = $1
            and a.attnum > 0
            and (c.relkind = 'r' or c.relkind = 'p')
            and not attisdropped
            and a.attinhcount = 0
        order by
            n.nspname ,
            c.relname,
            a.attnum;`, [this.schema])).rows;
    }
}