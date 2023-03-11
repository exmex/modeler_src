import { CommonColumnMetadata } from "re";

export class JSONTableColumn {
    public tablename: string;
    public column: CommonColumnMetadata;

    public constructor(tablename: string, column: CommonColumnMetadata) {
        this.tablename = tablename;
        this.column = column;
    }

    public getFullname(): string {
        return `${this.tablename}.${this.column.name}`;
    }
}
