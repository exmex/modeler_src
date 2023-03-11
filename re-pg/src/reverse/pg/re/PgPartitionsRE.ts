import { PgRE } from "./PgRE";
import { PgPartitionsRow } from "./PgPartitionsRow";

export class PgPartitionsRE extends PgRE<PgPartitionsRow>{

    public async reverse(): Promise<PgPartitionsRow[]> {
        if (!this.features.tablePartitions()) {
            return [];
        }
        return (await this.connection.query(
            `with recursive inheritance_tree as (
                select
                    c.oid as table_oid ,
                    n.nspname as table_schema ,
                    c.relname as table_name ,
                    null::name as table_parent_schema ,
                    null::name as table_parent_name ,
                    c.relispartition is_partition,
                    c.relnamespace _table_tablespace_oid,
                    c.reloptions _table_options
                from
                    pg_class c
                join pg_namespace n on
                    n.oid = c.relnamespace
                where
                    c.relkind = 'p'
                    and c.relispartition = false
                union all
                select
                    inh.inhrelid as table_oid ,
                    n.nspname as table_schema ,
                    c.relname as table_name ,
                    nn.nspname as table_parent_schema ,
                    cc.relname as table_parent_name ,                    
                    c.relispartition is_partition,                    
                    c.reltablespace _table_tablespace_oid,
                    c.reloptions _table_options
                from
                    inheritance_tree it
                join pg_inherits inh on
                    inh.inhparent = it.table_oid
                join pg_class c on
                    inh.inhrelid = c.oid
                join pg_class cc on
                    it.table_oid = cc.oid
                join pg_namespace n on
                    n.oid = c.relnamespace
                join pg_namespace nn on
                    nn.oid = cc.relnamespace)
                select
                    it.table_schema _table_schema,
                    it.table_name _table_name,
                    ts.spcname _table_tablespace,
                    array_agg(a.attname order by a.attnum ) _columns,                    
                    case p.partstrat
                        when 'l' then 'BY LIST'
                        when 'r' then 'BY RANGE'
                        when 'h' then 'BY HASH'
                        else null 
                    end _partition_type ,
                        it.table_parent_schema _parent_table_schema,
                        it.table_parent_name _parent_table_name,
                        pg_get_expr(c.relpartbound,c.oid,true) as _partitioning_values ,
                        pg_get_expr(p.partexprs,c.oid,true) as _sub_partitioning_values,
                        c.reloptions _table_options
                    from
                            inheritance_tree it
                        join pg_class c on
                            c.oid = it.table_oid
                        left join pg_tablespace ts on
                            ts.oid = it._table_tablespace_oid
                        left join pg_partitioned_table p on
                            p.partrelid = it.table_oid
                        left join pg_catalog.pg_attribute a on
                            a.attrelid = c."oid"
                            and a.attnum = any(p.partattrs)
                            and not a.attisdropped
                            and it.table_schema = $1
                        group by
                            _table_schema,
                            _table_name,
                            _partition_type,
                            _parent_table_schema,
                            _parent_table_name,
                            _partitioning_values,
                            _sub_partitioning_values,
                            p.partattrs,
                            ts.spcname,
                            c.reloptions
                        order by
                            1,
                            2;`, [this.schema])).rows;
    }
}

