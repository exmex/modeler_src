import { SourceMetadata } from "../provider/SourceMetadata";
import { SourceGenerator } from "./SourceGenerator";
import { PgQuotation } from "../../../../db/pg/pg-quotation";

export class PgViewSourceGenerator implements SourceGenerator<SourceMetadata> {
    constructor(
        private quotation: PgQuotation,
        private includeSchema: boolean
    ) { }

    public generate(metadata: SourceMetadata): string {
        const name = this.quotation.generateName(this.includeSchema, metadata._schema, metadata._name);
        return `CREATE OR REPLACE VIEW ${name}\n`
            + `AS\n`
            + `${metadata._code.replace(/;$/, '')};\n`;
    }
}