import { ArrayParser } from "../../model/provider/ArrayParser";
import { PgAncestorFinder } from "./PgAncestorFinder";
import { PgConstraintMetadata } from "../../model/metadata/PgConstraintMetadata";
import { PgPartitionsRE } from "../PgPartitionsRE";
import { PgPartitionsRow } from "../PgPartitionsRow";
import { PgQuotation } from "../../../../db/pg/pg-quotation";
import { PgTablesMetadata } from "../../model/metadata/PgTableMetadata";

export class PgPartitionMetadataBuilder {
    public constructor(private parser: ArrayParser, private partitionsRE: PgPartitionsRE, private quotation: PgQuotation, private ancestorFinder: PgAncestorFinder) { }

    private getConstraints(tables: PgTablesMetadata, tableName: string): string | undefined {
        const table = Object.keys(tables).map((key) => tables[key]).find((currentTable) => currentTable.name === tableName);
        if (table) {
            const constraints = table.constraints.filter((con) => !this.ancestorFinder.isSameKeyInAncestor(con, table, tables));
            if (constraints.length > 0) {
                return this.getConstraintsCode(constraints);
            }
        }
        return undefined
    }

    private getConstraintsCode(constraints: PgConstraintMetadata[]): string | undefined {
        return `(${constraints.map((constraint) => this.getContraintCode(constraint)).join(",")})`;
    }

    private getContraintCode(constraint: PgConstraintMetadata): string {
        return `CONSTRAINT ${constraint.name} ${constraint.definition}`;
    }

    public async reversePartitions(tables: PgTablesMetadata): Promise<PgTablesMetadata> {
        const rows = await this.partitionsRE.reverse();
        const roots: { [key: string]: string[] } = {};
        rows.forEach((row) => {
            const parentid = (!row._parent_table_schema && !row._parent_table_name) ? null : `${this.quotation.quoteIdentifier(row._parent_table_schema)}.${this.quotation.quoteIdentifier(row._parent_table_name)}`;
            const id = `${this.quotation.quoteIdentifier(row._table_schema)}.${this.quotation.quoteIdentifier(row._table_name)}`;
            let target: string | undefined;
            if (!parentid) {
                roots[id] = [id];
                target = id;
            } else {
                target = Object.keys(roots).map((key) => ({ items: roots[key], key })).reduce<string | undefined>((r, i) => r ? r : (i.items.find((x) => x === parentid) ? i.key : undefined), undefined)
                if (target) {
                    roots[target].push(id);
                }
            }

            const table = Object.keys(tables).map((key) => tables[key]).find((currentTable) => `${this.quotation.quoteIdentifier(currentTable.schema)}.${this.quotation.quoteIdentifier(currentTable.name)}` === target);
            if (table) {
                if (!parentid) {
                    table.partition = `${row._partition_type} (${this.parser.parse(row._columns)})`;
                } else {
                    const constraints = this.getConstraints(tables, row._table_name);
                    table.partitions.push(
                        `CREATE TABLE ${this.quotation.quoteIdentifier(row._table_name)}` +
                        ` PARTITION OF ${this.quotation.quoteIdentifier(row._parent_table_name)}${constraints ? ` ${constraints}` : ""}` +
                        ` ${row._partitioning_values}` +
                        `${row._partition_type ? this.partitionCode(row) : ""}` +
                        `${row._table_tablespace ? this.tablespaceCode(row) : ""}` +
                        `${row._table_options ? this.withCode(row) : ""};`);
                    table.partitionNames.push(row._table_name);
                }
            }
        });
        return tables;
    }

    private withCode(row: PgPartitionsRow) {
        return ` WITH(${row._table_options})`;
    }

    private tablespaceCode(row: PgPartitionsRow) {
        return ` TABLESPACE ${row._table_tablespace}`;
    }

    private partitionCode(row: PgPartitionsRow) {
        return ` PARTITION ${row._partition_type} (${this.parser.parseString(row._columns)})`;
    }
}