import { PgRE } from "./PgRE";
import { PgTableRow } from "./PgTableRow";

export class PgTableRE extends PgRE<PgTableRow> {
  public async reverse(): Promise<PgTableRow[]> {
    return (
      await this.connection.query(
        `select
            c.relrowsecurity _rowsecurity,
            pg_get_userbyid(c.relowner) _owner,
            n.nspname _schema,
            c.relname _name,
            obj_description(c.oid) _comment,
            t.spcname _tablespace,
            array(
            select
                c1.relname
            from
                pg_catalog.pg_inherits i
            join pg_catalog.pg_class c1 on
                i.inhparent = c1.oid
            where
                i.inhrelid = c.oid) _inherits,
                c.reloptions _storageparameters
        from
        pg_catalog.pg_class c 
        join pg_catalog.pg_namespace n on
            n.oid = c.relnamespace
        left join pg_catalog.pg_tablespace t on
            t.oid = c.reltablespace 
        where
            n.nspname = $1
            and (c.relkind = 'r' or c.relkind = 'p')
        order by
            n.nspname ,
            c.relname;
        `,
        [this.schema]
      )
    ).rows;
  }
}
