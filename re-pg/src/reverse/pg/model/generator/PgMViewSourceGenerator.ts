import { PgMViewMetadata } from "../metadata/PgMViewMetadata";
import { PgQuotation } from "../../../../db/pg/pg-quotation";
import { SourceGenerator } from "./SourceGenerator";

export class PgMViewSourceGenerator implements SourceGenerator<PgMViewMetadata> {
    constructor(private quotation: PgQuotation, private includeSchema: boolean) { }

    public generate(metadata: PgMViewMetadata): string {
        const name = this.quotation.generateName(this.includeSchema, metadata._schema, metadata._name);
        const storageParameters = this.getStorageParameters(metadata);
        const tablespace = this.getTablespace(metadata);
        const withData = this.getWithData(metadata);
        const code = metadata._code.replace(/;$/, '');

        return `CREATE MATERIALIZED VIEW ${name}${storageParameters}${tablespace}\n`
            + `AS\n`
            + `${code}${withData};\n`;
    }

    private getStorageParameters(metadata: PgMViewMetadata) {
        return metadata._storageparameters.length > 0 ?
            `\nWITH(${metadata._storageparameters.reduce<string>((r: string, i: string) => this.reduceStorageParameters(r, i), "")})` : "";
    }

    private reduceStorageParameters(r: string, i: string): string {
        return r === "" ? `${i}` : `${r},${i}`;
    }

    private getTablespace(metadata: PgMViewMetadata) {
        return metadata._tablespace ? `\nTABLESPACE "${metadata._tablespace}"` : "";
    }

    private getWithData(metadata: PgMViewMetadata) {
        return metadata._withdata ? `\nWITH DATA` : `\nWITH NO DATA`;
    }
}