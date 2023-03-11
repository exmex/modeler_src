import { DependenciesRegistry, SQLHandledConnection } from "re";

import { OtherObjects } from "common";
import { PgFeatures } from "../../PgFeatures";

export class PgViewMViewDependencyResolver {
    constructor(private connection: SQLHandledConnection<PgFeatures>, private schema: string, private dependencyRegistry: DependenciesRegistry) { }

    async resolve(otherObjects: OtherObjects) {
        const query = `SELECT
          p.relname AS parent_tablename,
          c.relname AS child_tablename
           FROM pg_depend AS d
              JOIN pg_rewrite AS r
                 ON r.oid = d.objid
              JOIN pg_class AS p
                 ON p.oid = r.ev_class
              JOIN pg_class AS c
                 ON c.oid = d.refobjid
              join pg_namespace as pn
                 on pn.oid = p.relnamespace 
              join pg_namespace as cn
                 on cn.oid = c.relnamespace 
           WHERE ((p.relkind = 'v' or p.relkind = 'm') and (c.relkind = 'v' or c.relkind = 'm'))
             AND  d.classid = 'pg_rewrite'::regclass
             AND d.refclassid = 'pg_class'::regclass
             and p.oid <> c.oid
        and pn.nspname = $1 and cn.nspname = $1`

        const queryResultRaw = (await this.connection.query(query, [this.schema])).rows;
        queryResultRaw.forEach((row: { parent_tablename: string; child_tablename: string; }) => {
            const parentId = this.getIdByName(otherObjects, row.parent_tablename);
            const childId = this.getIdByName(otherObjects, row.child_tablename);
            if (parentId && childId) {
                this.dependencyRegistry.registerDependencies(parentId, row.parent_tablename, childId, row.child_tablename);
            }
        });
    }

    getIdByName(otherObjects: OtherObjects, name: string): string | undefined {
        const objs = Object.keys(otherObjects).map(key => otherObjects[key]);
        const foundObj = objs.find(item => item.name === name);
        return foundObj?.id;
    }

}