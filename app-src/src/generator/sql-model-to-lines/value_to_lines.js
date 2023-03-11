
export class ValueToLines {
    constructor(sqlModelToLines, item) {
        this.sqlModelToLines = sqlModelToLines;
        this.item = item;
      }
    
      generateLines() {
        this.item.lines = this.item.value !== "" ? [this.item.value] : [];
        return this.item.lines;
      }
    }
