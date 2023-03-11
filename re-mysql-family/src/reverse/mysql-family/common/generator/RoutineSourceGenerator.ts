import { DefinerQuotation } from "./DefinerQuotation";
import { RoutineMetadata } from "../metadata/RoutineMetadata";
import { RoutineParameter } from "./RoutineParameter";

export class RoutineSourceGenerator {
    public constructor(private routineMetadata: RoutineMetadata) {
    }

    public generate(): string {
        // https://mariadb.com/kb/en/library/create-procedure/
        // https://mariadb.com/kb/en/library/create-function/
        return (
            `CREATE\n` +
            `${this.evalDefiner()}` +
            `${this.evalAggregate()}${this.evalType()} ${this.routineMetadata.name}${this.evalParameters()}\n` +
            `${this.evalReturnDatatype()}` +
            `${this.evalDeterministic()}` +
            `${this.evalSqlAccess()}` +
            `${this.evalSecurity()}` +
            `${this.evalComment()}` +
            `${this.routineMetadata.routineDefinition}` +
            `;`
        );
    }
    private evalReturnDatatype(): string {
        if (this.routineMetadata.type === "FUNCTION") {
            return `RETURNS ${this.routineMetadata.returnDatatype}\n`;
        }
        return "";
    }

    private evalParameters(): string {
        const parameters = this.routineMetadata.parameters
            .map(
                (parameter: RoutineParameter): string =>
                    `${parameter.fncIn && this.routineMetadata.type !== "FUNCTION" ? "IN " : ""}` +
                    `${parameter.fncOut ? "OUT " : ""}` +
                    `${parameter.fncInout ? "INOUT " : ""}` +
                    `${parameter.name} ${parameter.type}`,
            )
            .join(",");

        return `(${parameters})`;
    }

    private getQuotedComment(comment: string): string {
        return comment ? comment.replace(/'/g, "''") : "";
    }

    private evalComment(): string {
        if (this.routineMetadata.comment) {
            return `COMMENT '${this.getQuotedComment(this.routineMetadata.comment)}'\n`;
        }
        return "";
    }

    private evalSecurity(): string {
        return `SQL SECURITY ${this.routineMetadata.sqlSecurity}\n`;
    }

    private evalSqlAccess(): string {
        return this.routineMetadata.sqlAccess + `\n`;
    }

    private evalDeterministic(): string {
        return this.routineMetadata.deterministic ? "DETERMINISTIC\n" : "";
    }

    private evalType(): string {
        return this.routineMetadata.type;
    }

    private evalAggregate(): string {
        return this.routineMetadata.aggregate ? `AGGREGATE ` : "";
    }

    private evalDefiner(): string {
        if (this.routineMetadata.sqlSecurity === "DEFINER") {
            return `\tDEFINER = ${DefinerQuotation.quoteDefiner(this.routineMetadata.definer)}\n`;
        }
        return "";
    }
}
