import { BracketType } from "../model-to-sql-model/sql_model_builder";

export class BraketsToLines {
  constructor(sqlModelToLines, item) {
    this.sqlModelToLines = sqlModelToLines;
    this.item = item;
  }

  generateLines() {
    const openBracket =
      this.item.bracketType === BracketType.SQUARE ? "[" : "(";
    const closeBracket =
      this.item.bracketType === BracketType.SQUARE ? "]" : ")";

    this.sqlModelToLines.generateLines(this.item.nestedItem);

    const textInsideBrackets =
      this.item.nestedItem.lines.length === 1
        ? this.item.nestedItem.lines[0].trim()
        : ``;
    this.item.lines =
      this.item.nestedItem.lines.length > 1
        ? [openBracket, ...this.item.nestedItem.lines, closeBracket]
        : [`${openBracket}${textInsideBrackets}${closeBracket}`];
    return this.item.lines;
  }
}
