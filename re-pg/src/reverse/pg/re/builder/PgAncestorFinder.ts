import { PgConstraintMetadata } from "../../model/metadata/PgConstraintMetadata";
import { PgTablesMetadata, PgTableMetadata } from "../../model/metadata/PgTableMetadata";

export class PgAncestorFinder {
    private findTableInMetadata(name: string, tablesMetadata: PgTablesMetadata): PgTableMetadata | undefined {
        return Object.keys(tablesMetadata).map(key => tablesMetadata[key]).find(table => table.name === name);
    }

    public isSameKeyInAncestor(con: PgConstraintMetadata, item: PgTableMetadata, tablesMetadata: PgTablesMetadata): boolean {
        const ancestorTables = item.inheritsArr
            .map(name => this.findTableInMetadata(name, tablesMetadata));

        const ancestorTableWithSameKey = ancestorTables.find((t) => t && t.constraints.find(c => {
            return c.type === con.type && c.columns.toString() === con.columns.toString()
        }));

        return (ancestorTableWithSameKey)
            ? true
            : ancestorTables.map(at => at ? this.isSameKeyInAncestor(con, at, tablesMetadata) : false).reduce((r, i) => i && (i === true) ? true : r, false);
    }
}