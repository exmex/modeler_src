import { SourceGenerator } from "./SourceGenerator";
import { PgQuotation } from "../../../../db/pg/pg-quotation";
import { PgRuleMetadata } from "../metadata/PgRuleMetadata";

export class PgRuleSourceGenerator implements SourceGenerator<PgRuleMetadata> {
    constructor(private quotation: PgQuotation, private includeSchema: boolean) {
    }

    public generate(metadata: PgRuleMetadata): string {
        const schemaItemName = `${this.quotation.quoteIdentifier(metadata._schema)}.${this.quotation.quoteIdentifier(metadata._tablename)}`;
        const itemName = this.quotation.quoteIdentifier(metadata._tablename);
        return `${this.includeSchema === true ? metadata._code : metadata._code.replace(schemaItemName, itemName)}${this.getCommentDDL(metadata)}`;
    }

    private getCommentDDL(metadata: PgRuleMetadata): string {
        const ruleName = this.quotation.quoteIdentifier(metadata._name);
        const tableName = this.quotation.generateName(this.includeSchema, metadata._schema, metadata._tablename);
        return metadata._comment
            ? `\nCOMMENT ON RULE ${ruleName} ` +
            `ON ${tableName} ` +
            `IS '${metadata._comment}';`
            : '';
    }
}