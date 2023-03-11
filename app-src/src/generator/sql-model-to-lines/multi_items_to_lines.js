import { INDENTATION_STRING_TABS } from "./model_to_lines";
import { TokenType } from "../model-to-sql-model/sql_model_builder";

const EMPTY_STRING = "";

export class MultiItemsToLines {
  constructor(
    sqlModelToLines,
    item,
    tokenWhiteSpaceSeparator,
    tokenListSeparator
  ) {
    this.sqlModelToLines = sqlModelToLines;
    this.item = item;
    this.tokenWhiteSpaceSeparator = tokenWhiteSpaceSeparator;
    this.tokenListSeparator = tokenListSeparator;

    this.joinLines = this.joinLines.bind(this);
    this.isInMaxListItemsOnLineLimit = this.isInMaxListItemsOnLineLimit.bind(
      this
    );
    this.indent = this.indent.bind(this);
    this.newLine = this.indentAndSeparateList.bind(this);
  }

  get sqlSettings() {
    return this.sqlModelToLines.sqlSettings;
  }

  generateLines() {
    this.item.nestedItems.forEach(nestedItem =>
      this.sqlModelToLines.generateLines(nestedItem)
    );
    this.item.lines = this.item.nestedItems.reduce(this.joinLines, []);
    return this.item.lines;
  }

  shouldMergeLastLineWithNewlines(nestedItem, nestedItems) {
    return (
      (nestedItem.lines.length === 1 ||
        (nestedItem.lines.length > 1 && nestedItem.adherent === true)) &&
      this.isInMaxListItemsOnLineLimit(nestedItems.length) &&
      !this.isComment(nestedItem) &&
      !this.isDelimiterDefinition(nestedItem) &&
      !this.isRoutineDelimiter(nestedItem)
    );
  }

  isComment(nestedItem) {
    return nestedItem.type === TokenType.COMMENT;
  }

  isCode(nestedItem) {
    return nestedItem.type === TokenType.CODE;
  }

  isDelimiterDefinition(nestedItem) {
    return nestedItem.type === TokenType.STATEMENT_DELIMITER_DEFINE;
  }

  isRoutineDelimiter(nestedItem) {
    return (
      nestedItem.type === TokenType.STATEMENT_DELIMITER && (nestedItem.isRoutine || nestedItem.newLine)
    );
  }

  isInMaxListItemsOnLineLimit(itemsOnLineCount) {
    const limitItemsOnLine = this.sqlSettings.limitItemsOnLine;
    const maxListItemsOnLine = this.sqlSettings.maxListItemsOnLine;
    return (
      (this.item.type === TokenType.LIST &&
        (!limitItemsOnLine ||
          !(
            Number.isInteger(Number(maxListItemsOnLine)) &&
            maxListItemsOnLine > 0
          ) ||
          (limitItemsOnLine === true &&
            maxListItemsOnLine >= itemsOnLineCount))) ||
      this.item.type !== TokenType.LIST
    );
  }

  joinLines(currentLines, nestedItem, nestedItemIndex, nestedItems) {
    let result = [];
    const afterDelimiter =
      nestedItemIndex > 0
        ? this.isDelimiterDefinition(nestedItems[nestedItemIndex - 1]) ||
        this.isRoutineDelimiter(nestedItems[nestedItemIndex - 1])
        : false;
    const onDelimiter =
      this.isDelimiterDefinition(nestedItem) ||
      this.isRoutineDelimiter(nestedItem);
    const resetIndent = afterDelimiter || onDelimiter;
    result =
      !afterDelimiter &&
        this.shouldMergeLastLineWithNewlines(nestedItem, nestedItems)
        ? this.mergeLastLineWithNewLines(
          currentLines,
          nestedItem,
          nestedItemIndex
        )
        : this.joinNewLinesToResult(
          currentLines,
          nestedItem,
          nestedItemIndex,
          resetIndent
        );
    return result;
  }

  getTokenListSeparator(isNotLastItem) {
    return this.tokenListSeparator && isNotLastItem
      ? this.tokenListSeparator
      : "";
  }

  isNonEmptyStatement(nestedItem) {
    return (
      nestedItem.type === TokenType.STATEMENT && nestedItem.lines.length > 0
    );
  }

  indentAndSeparateList(nestedItem, newLine, isNotLastItem, isFirst) {
    const listSeparator = this.getTokenListSeparator(isNotLastItem);
    return `${isFirst && this.item.type === TokenType.STATEMENT
      ? EMPTY_STRING
      : this.indent(nestedItem, this.item)
      }${newLine}${listSeparator}`;
  }

  joinNewLinesToResult(result, nestedItem, nestedItemIndex, resetIndent) {
    if (this.isNonEmptyStatement(nestedItem)) {
      return [...result, ...nestedItem.lines, EMPTY_STRING];
    }

    const modifiedResult = [...result];
    const lastLine = modifiedResult.pop(1);
    const isNotLastItem = nestedItemIndex < this.item.nestedItems.length - 1;

    const restLines = nestedItem.lines.map((line, index, arr) =>
      this.newLineArray(
        nestedItem,
        line,
        index,
        arr,
        isNotLastItem,
        resetIndent && index === 0
      )
    );
    return lastLine !== undefined
      ? [...modifiedResult, lastLine, ...restLines]
      : [...modifiedResult, ...restLines];
  }

  newLineArray(nestedItem, line, index, arr, isNotLastItem, resetIndent) {
    const indent = !resetIndent ? this.indent(nestedItem, this.item) : ``;
    return `${indent}${line}${this.addTokenListSeparatonAtLastLine(
      index,
      arr,
      isNotLastItem
    )}`;
  }

  addTokenListSeparatonAtLastLine(index, arr, isNotLastItem) {
    return index === arr.length - 1
      ? this.getTokenListSeparator(isNotLastItem)
      : ``;
  }

  needBreakLine(newLineLength) {
    return (
      this.sqlSettings.wrapLines &&
      this.sqlSettings.wrapOffset &&
      newLineLength > this.sqlSettings.wrapOffset
    );
  }

  isStatement(nestedItem) {
    return (
      this.item.type === TokenType.STATEMENTS &&
      nestedItem.type !== TokenType.COMMENT
    );
  }

  indent(nestedItem, item) {
    const indentValue =
      this.sqlSettings.indentationString === INDENTATION_STRING_TABS
        ? "\t"
        : " ";
    const indentationSizeString = this.sqlSettings.indentationSize;
    const indentationSize =
      Number.isInteger(Number(indentationSizeString)) &&
      Number(indentationSizeString) >= 0;

    const indent = indentationSize
      ? [...Array.from(Array(+this.sqlSettings.indentationSize).keys())]
        .map(() => indentValue)
        .join("")
      : "";

    const indentString =
      nestedItem.type !== TokenType.COMMENT &&
        !this.isDelimiterDefinition(nestedItem) &&
        !this.isCode(nestedItem)
        ? indent
        : EMPTY_STRING;
    return this.sqlSettings.indent ? indentString : EMPTY_STRING;
  }

  addStatement(result, nestedItem) {
    return nestedItem.lines.length > 0
      ? [...result, ...nestedItem.lines, EMPTY_STRING]
      : result;
  }

  addNewLine(result, nestedItem, nestedItemIndex) {
    const modifiedResult = [...result];
    const lastLine = modifiedResult.pop();
    const isFirst = lastLine === undefined;
    const isNotLastItem = nestedItemIndex < this.item.nestedItems.length - 1;
    const nestedLines = nestedItem.lines.map(line =>
      this.indentAndSeparateList(nestedItem, line, isNotLastItem, isFirst)
    );
    return isFirst === true
      ? [...modifiedResult, ...nestedLines]
      : [...modifiedResult, lastLine, ...nestedLines];
  }

  mergeLastLineWithNewLine(result, nestedItem, nestedItemIndex, separator) {
    const modifiedResult = [...result];
    const lastLine = modifiedResult.pop(1);
    const restLines =
      lastLine !== undefined
        ? [
          lastLine + separator + nestedItem.lines[0],
          ...nestedItem.lines.slice(1)
        ]
        : nestedItem.lines;
    const isNotLastItem = nestedItemIndex < this.item.nestedItems.length - 1;
    const rest = restLines.map(
      line => `${line}${this.getTokenListSeparator(isNotLastItem)}`
    );

    return [...modifiedResult, ...rest];
  }

  mergeLastLineWithNewLines(currentLines, nestedItem, nestedItemIndex) {
    const whiteSpaceSeparator =
      nestedItem.adherent === true
        ? EMPTY_STRING
        : this.tokenWhiteSpaceSeparator;
    let result = [...currentLines];
    const addedText = nestedItem.lines[0] || "";
    const currentLastLine = result.length > 0 ? result[result.length - 1] : ``;
    const newMergedLineLength =
      currentLastLine.length + whiteSpaceSeparator.length + addedText.length;
    if (this.isStatement(nestedItem)) {
      result = this.addStatement(result, nestedItem);
    } else if (this.needBreakLine(newMergedLineLength)) {
      result = this.addNewLine(result, nestedItem, nestedItemIndex);
    } else {
      result = this.mergeLastLineWithNewLine(
        result,
        nestedItem,
        nestedItemIndex,
        whiteSpaceSeparator
      );
    }
    return result;
  }
}
