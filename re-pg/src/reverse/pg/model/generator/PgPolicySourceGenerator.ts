import { SourceGenerator } from "./SourceGenerator";
import { PgQuotation } from "../../../../db/pg/pg-quotation";
import { PgPolicyMetadata } from "../metadata/PgPolicyMetadata";
import { ArrayParser } from "../provider/ArrayParser";

export class PgPolicySourceGenerator implements SourceGenerator<PgPolicyMetadata> {
    constructor(private quotation: PgQuotation, private arrayParser: ArrayParser, private includeSchema: boolean) {
    }

    private tableName(metadata: PgPolicyMetadata): string {
        return this.quotation.generateName(this.includeSchema, metadata._schema, metadata._table_name);
    }

    private name(metadata: PgPolicyMetadata): string {
        return this.quotation.quoteIdentifier(metadata._name);
    }

    private pemissive(permissive: boolean): string {
        if (!permissive) {
            return `\nAS RESTRICTIVE`;
        }
        return ``;
    }

    private command(command: string): string {
        return `\nFOR ${command}`;
    }

    private roles(roles: string): string {
        const parsedRoles = this.arrayParser.parse(roles);
        return `\nTO ${parsedRoles.map((role) => this.quotation.quoteIdentifier(role)).join(",")}`;
    }

    private usingExpression(usingExpression: string): string {
        return usingExpression ? `\nUSING ${usingExpression}` : ``;
    }

    private checkExpression(checkExpression: string): string {
        return checkExpression ? `\nWITH CHECK ${checkExpression}` : ``;
    }

    public generate(metadata: PgPolicyMetadata): string {
        return `CREATE POLICY ${this.name(metadata)} ON ${this.tableName(metadata)}` +
            `${this.pemissive(metadata._permissive)}` +
            `${this.command(metadata._command)}` +
            `${this.roles(metadata._roles)}` +
            `${this.usingExpression(metadata._using_expression)}` +
            `${this.checkExpression(metadata._check_expression)}` +
            `;\n`;
    }
}