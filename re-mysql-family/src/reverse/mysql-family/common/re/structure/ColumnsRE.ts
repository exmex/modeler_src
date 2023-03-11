import { ColumnMetadataBuilder } from "./builder/ColumnMetadataBuilder";
import { MySQLFamilyFeatures } from "../../MySQLFamilyFeatures";
import { QueryExecutor } from "re";
import { TableMetadata } from "../../metadata/TableMetadata";

export class ColumnsRE {
    public constructor(
        private queryExecutor: QueryExecutor,
        private schema: string,
        private features: MySQLFamilyFeatures,
        private builder: ColumnMetadataBuilder) {
    }

    public async reverse(tablesMetadata: Map<string, TableMetadata>): Promise<void> {
        const result = await this.queryExecutor.query(this.buildQuery(), [this.schema]);
        this.builder.transform(result, tablesMetadata);
    }

    private buildQuery() {
        return `SELECT\n`
            + `cols.TABLE_NAME,\n`
            + `cols.COLUMN_NAME,\n`
            + `cols.DATA_TYPE,\n`
            + `cols.COLUMN_TYPE,\n`
            + `cols.IS_NULLABLE,\n`
            + `cols.COLUMN_COMMENT,\n`
            + `CASE WHEN cols.COLUMN_DEFAULT='NULL' then null else cols.COLUMN_DEFAULT end COLUMN_DEFAULT,\n`
            + `cols.COLLATION_NAME,\n`
            + `${this.features.generationExpression() ? `cols.GENERATION_EXPRESSION,\n` : `'' as GENERATION_EXPRESSION,\n`}`
            + `cols.EXTRA,\n`
            + `colls.CHARACTER_SET_NAME\n`
            + `FROM information_schema.columns cols\n`
            + `LEFT JOIN information_schema.collations colls ON\n`
            + `cols.COLLATION_NAME = colls.COLLATION_NAME\n`
            + `WHERE cols.TABLE_SCHEMA = ?\n`
            + `ORDER BY cols.TABLE_SCHEMA, cols.TABLE_NAME, cols.ORDINAL_POSITION\n`;
    }
}
