import { PgQuotation } from "../../../../db/pg/pg-quotation";

export class PgExpressionIndexGenerator {
    constructor(private quotation: PgQuotation) {
        this.quotation = quotation;
    }
    public generate(schema: string, name: string, expressionIndexCode?: string): string {
        const schemaItemName = `${this.quotation.quoteIdentifier(schema)}.${this.quotation.quoteIdentifier(name)}`;
        const itemName = this.quotation.quoteIdentifier(name);
        return expressionIndexCode ? `${expressionIndexCode.replace(schemaItemName, itemName)};` : ``;
    }
}