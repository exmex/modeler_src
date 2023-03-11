import {
  IDENTIFIER_CASE_LOWER,
  IDENTIFIER_CASE_UPPER,
  QUOTATION_ALWAYS
} from "./model_to_lines";

export class IdentifierToLines {
  constructor(sqlModelToLines, item) {
    this.sqlModelToLines = sqlModelToLines;
    this.item = item;
  }

  getIdentifierText() {
    const quotation = this.sqlModelToLines.sqlSettings.quotation;
    const quotedIdentifier = this.sqlModelToLines.quotation.quoteIdentifier(
      this.item.value,
      quotation === QUOTATION_ALWAYS || this.item.forceQuotation
    );

    if (quotation === QUOTATION_ALWAYS || this.item.forceQuotation) {
      return quotedIdentifier;
    }

    return this.changeIdentifierCase(quotedIdentifier);
  }

  changeIdentifierCase(quotedIdentifier) {
    const identifierCase = this.sqlModelToLines.sqlSettings.identiferCase;
    switch (identifierCase) {
      case IDENTIFIER_CASE_UPPER:
        return this.item.value.toUpperCase() === quotedIdentifier.toUpperCase()
          ? quotedIdentifier.toUpperCase()
          : quotedIdentifier;
      case IDENTIFIER_CASE_LOWER:
        return this.item.value.toLowerCase() === quotedIdentifier.toLowerCase()
          ? quotedIdentifier.toLowerCase()
          : quotedIdentifier;
      default:
        return quotedIdentifier;
    }
  }

  generateLines() {
    const identifierText = this.getIdentifierText();
    this.item.lines = [identifierText];
    return this.item.lines;
  }
}
