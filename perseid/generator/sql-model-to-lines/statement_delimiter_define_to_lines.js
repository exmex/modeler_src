const DELIMITER_KEYWORD = "DELIMITER";

export class StatementDelimiterDefineToLines {
  constructor(sqlModelToLines, item) {
    this.sqlModelToLines = sqlModelToLines;
    this.item = item;
  }

  delimiter() {
    return this.item.isRoutine === true
      ? this.sqlModelToLines.sqlSettings.routineDelimiter
      : this.sqlModelToLines.sqlSettings.statementDelimiter;
  }

  generateLines() {
    this.item.lines = [`${DELIMITER_KEYWORD} ${this.delimiter()}`, ``];
    return this.item.lines;
  }
}
