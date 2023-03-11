import { CommonColumnLinkReference, CommonColumnReferenceMetadata } from "re";

import { KeyMetadata } from "../../metadata/KeyMetadata";
import { RelationMetadata } from "../../metadata/RelationMetadata";
import { TableMetadata } from "../../metadata/TableMetadata";

export class RelationCardinalityResolver {

    public resolve(tablesMetadata: Map<string, TableMetadata>, relationsMetadata: Map<string, RelationMetadata>): void {
        const tables = Array.from(tablesMetadata.values());
        relationsMetadata.forEach((relationMetadata: RelationMetadata): void => {
            relationMetadata.cardinalityChild = "many";

            const childTable = tables.find((table: TableMetadata): boolean => table.id === relationMetadata.child);
            if (!childTable) {
                throw new Error("Child table not found.")
            }
            const childTableVal = tablesMetadata.get(childTable.name);
            childTableVal.keys.forEach((key: KeyMetadata): void => {
                if (this.containAll(key.cols, relationMetadata.cols)) {
                    relationMetadata.cardinalityChild = "one";
                }
            });
        });
    }

    private containAll(cols: CommonColumnReferenceMetadata[], relationCols: CommonColumnLinkReference[]): boolean {
        if (relationCols.length !== cols.length) {
            return false;
        }
        let found = false;
        cols.forEach((colRef: CommonColumnReferenceMetadata): void => {
            relationCols.forEach((col: CommonColumnLinkReference): void => {
                if (colRef.colid === col.childcol) {
                    found = true;
                }
            });
            if (!found) {
                return;
            }
        });
        return found;
    }
}
