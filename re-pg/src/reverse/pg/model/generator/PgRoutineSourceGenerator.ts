import { SourceGenerator } from "./SourceGenerator";
import { PgQuotation } from "../../../../db/pg/pg-quotation";
import { PgRoutineMetadata } from "../metadata/PgRoutineMetadata";

export class PgRoutineSourceGenerator implements SourceGenerator<PgRoutineMetadata> {
    constructor(
        private quotation: PgQuotation,
        private includeSchema: boolean
    ) { }

    public generate(metadata: PgRoutineMetadata): string {
        const schemaItemName = `${this.quotation.quoteIdentifier(metadata._schema)}.${this.quotation.quoteIdentifier(metadata._name)}`;
        const itemName = this.quotation.quoteIdentifier(metadata._name);
        return `${this.includeSchema === true ? metadata._code : metadata._code.replace(schemaItemName, itemName)};\n`;
    }
}