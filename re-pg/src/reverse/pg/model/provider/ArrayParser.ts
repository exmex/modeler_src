import { PgQuotation } from "../../../../db/pg/pg-quotation";

export class ArrayParser {
    private readonly regexp: RegExp =
        new RegExp(/(^|,)\\"(?<id1>[^"]*)\\"|(^|,)"(?<id2>(\\"|[^"])*)"|(^|,)(?<id3>[^,]+)/g);

    private readonly getValue = (group: any) => group.id1
        ? group.id1
        : group.id2
            ? group.id2
            : group.id3;

    private readonly changeDoubleQuoteEscape = (value: string) => {
        return value && value.replace(/\\"/g, `"`);
    }

    public constructor(private quotation: PgQuotation) { }

    private findMatches(regex: RegExp, str: string, groups: object[]) {
        const res = regex.exec(str);
        const currentGroups = res ? (res as any)["groups"] : undefined;
        currentGroups && groups.push(currentGroups) && this.findMatches(regex, str, groups);
    }

    public parse(code: string): string[] {
        if (code) {
            const removedBrackets = code.replace(/[\]}[{]/g, "");
            const groups: object[] = [];
            this.findMatches(this.regexp, removedBrackets, groups);
            return groups
                .map(this.getValue).map(this.changeDoubleQuoteEscape);
        }
        return [];
    }

    public parseString(code: string): string {
        if (code) {
            const removedBrackets = code.replace(/[\]}[{]/g, "");
            const groups: object[] = [];
            this.findMatches(this.regexp, removedBrackets, groups);
            return groups
                .map(this.getValue).map(this.changeDoubleQuoteEscape).map((item) => this.quotation.quoteIdentifier(item)).join(",\n");
        }
        return "";
    }
}