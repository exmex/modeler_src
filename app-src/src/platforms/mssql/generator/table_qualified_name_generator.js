export class TableQualifiedNameGenerator {
  constructor(sqlModelBuilder, toLines) {
    this.sb = sqlModelBuilder;
    this.toLines = toLines;
  }

  generate(table) {
    const sqlIdentifierModel = this.sb.qualifiedIdentifier(table);
    return this.toLines.generateLines(sqlIdentifierModel).join("\n");
  }
}
