import { MySQLFamilySchemaMetadata } from "../../../metadata/MariaDBSchemaMetadata";

interface MariaDBSchemaMetadataBuilderRow {
    SCHEMA: string;
    DEFAULT_CHARACTER_SET_NAME: string;
    DEFAULT_COLLATION_NAME: string;
    SCHEMA_COMMENT: string;
}

export class MariaDBSchemaMetadataBuilder {
    public constructor(private result: MariaDBSchemaMetadataBuilderRow[], private database: string) {
    }

    public build(): MySQLFamilySchemaMetadata | undefined {
        let result = undefined;
        this.result.forEach((row: MariaDBSchemaMetadataBuilderRow): void => {
            result = new MySQLFamilySchemaMetadata(
                row.SCHEMA,
                row.SCHEMA_COMMENT,
                row.DEFAULT_COLLATION_NAME,
                row.DEFAULT_CHARACTER_SET_NAME,
                this.database);
        });

        return result;
    }
}
