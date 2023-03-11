import { PgQuotation } from "../../../../db/pg/pg-quotation";
import { PgTypeMetadata } from "../metadata/PgTypeMetadata";
import { SourceGenerator } from "./SourceGenerator";

export class PgTypeSourceGenerator implements SourceGenerator<PgTypeMetadata> {
    public constructor(
        private quotation: PgQuotation,
        private includeSchema: boolean
    ) { }

    public generate(metadata: PgTypeMetadata): string {
        switch (metadata._type.typeoftype) {
            case "e": return this.getEnum(metadata);
            case "p": return this.getPseudo(metadata);
            case "r": return this.getRange(metadata);
            case "m": return this.getRange(metadata);
            case "b": return this.getBasic(metadata);
            case "d": return this.getDomain(metadata);
        }
        throw new Error(`Unknown type: ${metadata._type.typeoftype}`);
    }

    private name(metadata: PgTypeMetadata): string {
        return this.quotation.generateName(this.includeSchema, metadata._schema, metadata._name);
    }

    private constraintExpr(metadata: PgTypeMetadata) {
        return metadata._type.constraints
            ? (metadata._type.constraints as any).map((cons: { name: string, constraint_def: string }) => {
                const constraintName = cons.name === `${metadata._name}_check` ? null : cons.name;
                return `${constraintName
                    ? `CONSTRAINT ${this.quotation.quoteIdentifier(constraintName)} `
                    : ``}${cons.constraint_def ? `${cons.constraint_def}` : ``}`;
            }).join(" ")
            : "";
    }

    private getDomain(metadata: PgTypeMetadata): string {
        return `CREATE DOMAIN ${this.name(metadata)} AS ${metadata._type.type}`
            + `${metadata._type.collation && metadata._type.collation !== 'default'
                ? `\nCOLLATE "${metadata._type.collation}"`
                : ""}`
            + `${metadata._type.default ? `\nDEFAULT ${metadata._type.default}` : ""}`
            + `${this.constraintExpr(metadata).length > 0
                ? `\n${this.constraintExpr(metadata)}`
                : ""}`
            + `${metadata._type.notnull
                ? `\nNOT NULL`
                : ""};`
            + `\n`;
    }


    private getEnum(metadata: PgTypeMetadata): string {
        return `CREATE TYPE ${this.name(metadata)} AS ENUM
    (${metadata._type.enum.map((item) => `'${item}'`).join(",")});` +
            `\n`;
    }

    private getPseudo(metadata: PgTypeMetadata): string {
        return `CREATE TYPE ${this.name(metadata)};` +
            `\n`;
    }


    private getRange(metadata: PgTypeMetadata): string {
        const res: string[] = [];
        if (metadata._type.subtype) {
            res.push(`SUBTYPE = ${metadata._type.subtype}`);
        }
        if (metadata._type.collation) {
            res.push(`COLLATION = ${metadata._type.collation}`);
        }
        if (metadata._type.canonical && metadata._type.canonical !== '-') {
            res.push(`CANONICAL = ${metadata._type.canonical}`);
        }
        if (metadata._type.subtype_opclass) {
            res.push(`SUBTYPE_OPCLASS = ${metadata._type.subtype_opclass}`);
        }
        if (metadata._type.subtype_diff) {
            res.push(`SUBTYPE_DIFF = ${metadata._type.subtype_diff}`);
        }

        return `CREATE TYPE ${this.name(metadata)} AS RANGE\n` +
            `(\n` +
            `${res.join(",\n")}\n` +
            `);\n`
    }

    private getBasic(metadata: PgTypeMetadata): string {
        const res: string[] = [];
        if (metadata._type.input) {
            res.push(`INPUT = ${metadata._type.input}`);
        }
        if (metadata._type.output) {
            res.push(`OUTPUT = ${metadata._type.output}`);
        }
        if (metadata._type.receive) {
            res.push(`RECEIVE = ${metadata._type.receive}`);
        }
        if (metadata._type.send) {
            res.push(`SEND = ${metadata._type.send}`);
        }
        if (metadata._type.typmod_in) {
            res.push(`TYPMOD_IN = ${metadata._type.typmod_in}`);
        }
        if (metadata._type.typmod_out) {
            res.push(`TYPMOD_OUT = ${metadata._type.typmod_out}`);
        }
        if (metadata._type.analyze) {
            res.push(`ANALYZE = ${metadata._type.analyze}`);
        }
        if (metadata._type.internallength) {
            res.push(`INTERNALLENGTH = ${metadata._type.internallength}`);
        }
        if (metadata._type.passedbyvalue) {
            res.push(`PASSEDBYVALUE`);
        }
        if (metadata._type.alignment) {
            res.push(`ALIGNMENT = ${metadata._type.alignment}`);
        }
        if (metadata._type.storage) {
            res.push(`STORAGE = ${metadata._type.storage}`);
        }
        if (metadata._type.category) {
            res.push(`CATEGORY = ${metadata._type.category}`);
        }
        if (metadata._type.preferred) {
            res.push(`PREFERRED = ${metadata._type.preferred}`);
        }
        if (metadata._type.default) {
            res.push(`DEFAULT = ${metadata._type.default}`);
        }
        if (metadata._type.element) {
            res.push(`ELEMENT = ${metadata._type.element}`);
        }
        if (metadata._type.delimiter) {
            res.push(`DELIMITER = ${metadata._type.delimiter}`);
        }
        if (metadata._type.collatable) {
            res.push(`COLLATABLE = ${metadata._type.collatable}`);
        }

        return `CREATE TYPE ${this.name(metadata)}` +
            `(\n` +
            `${res.join(",\n")}\n` +
            `);\n`;
    }
}