import { SourceGenerator } from "./SourceGenerator";
import { PgSequenceMetadata } from "../metadata/PgSequenceMetadata";
import { PgQuotation } from "../../../../db/pg/pg-quotation";

export class PgSequenceSourceGenerator implements SourceGenerator<PgSequenceMetadata> {
    constructor(
        private quotation: PgQuotation,
        private includeSchema: boolean
    ) { }

    public generate(metadata: PgSequenceMetadata): string {
        const name = this.quotation.generateName(this.includeSchema, metadata._schema, metadata._name);
        return `CREATE SEQUENCE IF NOT EXISTS ${name}\n` +
            `INCREMENT ${metadata._increment}\n` +
            `MINVALUE ${metadata._min}\n` +
            `MAXVALUE ${metadata._max}\n` +
            `START ${metadata._start}\n` +
            `CACHE ${metadata._cache}\n` +
            `${metadata._cycle ? `CYCLE` : `NO CYCLE`};\n`;
    }
}