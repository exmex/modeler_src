import { KEYWORD_CASE_LOWER } from "./model_to_lines";

export class KeywordToLines {
  constructor(sqlModelToLines, item) {
    this.sqlModelToLines = sqlModelToLines;
    this.item = item;
  }

  generateLines() {
    const keyword =
      this.sqlModelToLines.sqlSettings.keywordCase === KEYWORD_CASE_LOWER
        ? this.item.value.toLowerCase()
        : this.item.value.toUpperCase();
    this.item.lines = keyword !== "" ? [keyword] : [];
    return this.item.lines;
  }
}
