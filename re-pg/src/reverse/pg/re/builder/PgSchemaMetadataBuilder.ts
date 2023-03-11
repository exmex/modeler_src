import { CommonSchemaMetadata } from "re";

interface PgSchemaMetadataBuilderRow {
    _schema: string;
    _schema_comment: string;
}

export class PgSchemaMetadataBuilder {
    public constructor(private result: PgSchemaMetadataBuilderRow[]) {
    }

    public build(): CommonSchemaMetadata | undefined {
        let result = undefined;
        this.result.forEach((row: PgSchemaMetadataBuilderRow): void => {
            result = new CommonSchemaMetadata(row._schema, row._schema_comment);
        });

        return result;
    }
}
