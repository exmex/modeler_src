import { TableMetadata } from "../../../metadata/TableMetadata";

interface CheckConstraintMetadata {
    CONSTRAINT_TYPE: string;
    TABLE_NAME: string;
    CHECK_CLAUSE: string;
    CONSTRAINT_NAME: string;
}

export class CheckConstraintMetadataBuilder {
    public transform(result: CheckConstraintMetadata[], tablesMetadata: Map<string, TableMetadata>): void {
        result.forEach((row: CheckConstraintMetadata): void => {
            if (row.CONSTRAINT_TYPE == "CHECK") {
                const tableMetadata = tablesMetadata.get(row.TABLE_NAME);
                if (tableMetadata) {
                    this.addCheckConstraint(tableMetadata, row);
                }
            }
        });
    }

    private addCheckConstraint(tableMetadata: TableMetadata, row: CheckConstraintMetadata): void {
        const col = tableMetadata.columns.find((c) => c.name === row.CONSTRAINT_NAME);
        if (col) {
            col.after += ` CHECK(${row.CHECK_CLAUSE})`;
            if (row.CHECK_CLAUSE && row.CHECK_CLAUSE.toLowerCase().startsWith("json_valid")) {
                col.json = true;
            }
        } else {
            tableMetadata.afterScript += `ALTER TABLE \`${tableMetadata.database}\`.\`${tableMetadata.name}\`
ADD CONSTRAINT ${row.CONSTRAINT_NAME} CHECK(${row.CHECK_CLAUSE})`;
        }
    }
}
