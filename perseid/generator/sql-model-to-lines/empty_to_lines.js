export class EmptyToLines {
    constructor(sqlModelToLines, item) {
        this.sqlModelToLines = sqlModelToLines;
        this.item = item;
    }

    generateLines() {
        this.item.lines = [];
        return this.item.lines;
    }
}