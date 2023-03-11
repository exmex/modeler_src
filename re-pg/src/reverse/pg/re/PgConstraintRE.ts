import { PgRE } from "./PgRE";
import { PgConstraintRow } from "./PgConstraintRow";

export class PgConstraintRE extends PgRE<PgConstraintRow>{

    public async reverse(): Promise<PgConstraintRow[]> {
        return (await this.connection.query(
            `SELECT c.conname                               AS _constraintname,
            c.contype                                           AS _constrainttype,
            sch.nspname                                         AS _schema,
            tbl.relname                                         AS _table,
            ARRAY_AGG(col.attname ORDER BY u.attposition)      AS _columns,
            f_sch.nspname                                       AS _refschema,
            f_tbl.relname                                       AS _reftable,
            ARRAY_AGG(f_col.attname ORDER BY f_u.attposition)   AS _refcolumns,
            pg_get_constraintdef(c.oid)                         AS _definition,
            c.confupdtype								        AS _updatetype,
            c.confdeltype								        AS _deletetype,
            obj_description(c.oid)                              AS _comment
        FROM pg_constraint c
                LEFT JOIN LATERAL UNNEST(c.conkey) WITH ORDINALITY AS u(attnum, attposition) ON TRUE
                LEFT JOIN LATERAL UNNEST(c.confkey) WITH ORDINALITY AS f_u(attnum, attposition) ON f_u.attposition = u.attposition
                JOIN pg_class tbl ON tbl.oid = c.conrelid
                JOIN pg_namespace sch ON sch.oid = tbl.relnamespace
                LEFT JOIN pg_attribute col ON (col.attrelid = tbl.oid AND col.attnum = u.attnum and not col.attisdropped)
                LEFT JOIN pg_class f_tbl ON f_tbl.oid = c.confrelid
                LEFT JOIN pg_namespace f_sch ON f_sch.oid = f_tbl.relnamespace
                LEFT JOIN pg_attribute f_col ON (f_col.attrelid = f_tbl.oid AND f_col.attnum = f_u.attnum and not f_col.attisdropped)
        WHERE sch.nspname = $1
        GROUP BY _constraintname, _constrainttype, _schema, _table, _definition, _refschema, _reftable, _updatetype , _deletetype, c.oid
        ORDER BY _schema, _table
        `, [this.schema])).rows;
    }
}