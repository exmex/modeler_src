export class QuotedLiteralToLines {
    constructor(sqlModelToLines, item) {
        this.sqlModelToLines = sqlModelToLines;
        this.item = item;
    }

    generateLines() {
        this.item.lines = [this.sqlModelToLines.quotation.quoteLiteral(this.item.value)];
        return this.item.lines;
    }
}