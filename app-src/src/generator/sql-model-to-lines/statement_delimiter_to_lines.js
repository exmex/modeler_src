export class StatementDelimiterToLines {
  constructor(sqlModelToLines, item) {
    this.sqlModelToLines = sqlModelToLines;
    this.item = item;
  }

  generateLines() {
    this.item.lines =
      this.item.isRoutine === true
        ? [this.sqlModelToLines.sqlSettings.routineDelimiter, ``]
        : [this.sqlModelToLines.sqlSettings.statementDelimiter];
    return this.item.lines;
  }
}
