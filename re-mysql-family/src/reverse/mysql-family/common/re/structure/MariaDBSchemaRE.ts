import { MariaDBSchemaMetadataBuilder } from "./builder/MariaDBSchemaMetadataBuilder";
import { MySQLFamilyFeatures } from "../../MySQLFamilyFeatures";
import { MySQLFamilySchemaMetadata } from "../../metadata/MariaDBSchemaMetadata";
import { QueryExecutor } from "re";

const QUERY = `SELECT\n`
    + `SCHEMA_NAME, DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME, '' SCHEMA_COMMENT\n`
    + `FROM information_schema.schemata\n`
    + `where SCHEMA_NAME = ?`;

const QUERY_COMMENT = `SELECT\n`
    + `SCHEMA_NAME, DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME, SCHEMA_COMMENT\n`
    + `FROM information_schema.schemata\n`
    + `where SCHEMA_NAME = ?`;

export class MySQLFamilySchemaRE {
    public constructor(private queryExecutor: QueryExecutor, private schema: string, private features: MySQLFamilyFeatures) { }

    public async reverse(): Promise<MySQLFamilySchemaMetadata | undefined> {
        const result = await this.queryExecutor.query(this.features.schemaComments() ? QUERY_COMMENT : QUERY, [this.schema]);
        const builder = new MariaDBSchemaMetadataBuilder(result, this.schema);
        return builder.build();
    }
}
