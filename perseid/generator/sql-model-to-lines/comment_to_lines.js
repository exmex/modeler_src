
export class CommentToLines {
    constructor(sqlModelToLines, item) {
        this.sqlModelToLines = sqlModelToLines;
        this.item = item;
    }

    generateLines() {
        this.item.lines = [this.sqlModelToLines.quotation.quoteComment(this.item.value)];
        return this.item.lines;
    }
}