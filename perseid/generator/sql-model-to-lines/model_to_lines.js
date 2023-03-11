import { BraketsToLines } from "./brackets_to_lines";
import { CommentToLines } from "./comment_to_lines";
import { EmptyToLines } from "./empty_to_lines";
import { IdentifierToLines } from "./identifier_to_lines";
import { KeywordToLines } from "./keyword_to_lines";
import { MultiItemsToLines } from "./multi_items_to_lines";
import { QualifiedIdentifierToLines } from "./qualified_identifier_to_lines";
import { QuotedLiteralToLines } from "./quoted_literal_to_lines";
import { StatementDelimiterDefineToLines } from "./statement_delimiter_define_to_lines";
import { StatementDelimiterToLines } from "./statement_delimiter_to_lines";
import { TokenType } from "../model-to-sql-model/sql_model_builder";
import { ValueToLines } from "./value_to_lines";

const SPACE = " ";
const COMMA = ",";
const SEMICOLON = ";";
const EMPTY = "";
const ROUTINE_DELIMITER = "//";

export const INCLUDE_SCHEMA_ALWAYS = "always";
export const INCLUDE_SCHEMA_NEVER = "never";
export const INCLUDE_SCHEMA_WHEN_DIFFERS = "when_differs";

export const INCLUDE_SCHEMA = {
  always: "always",
  never: "never",
  when_differs: "when differs from project default"
};

export const KEYWORD_CASE_UPPER = "upper";
export const KEYWORD_CASE_LOWER = "lower";

export const KEYWORD_CASE = {
  upper: "upper",
  lower: "lower"
};

export const IDENTIFIER_CASE_UPPER = "upper";
export const IDENTIFIER_CASE_LOWER = "lower";
export const IDENTIFIER_CASE_ORIGINAL = "original";

export const IDENTIFIER_CASE = {
  upper: "upper",
  lower: "lower",
  original: "original"
};

export const QUOTATION_IF_NEEDED = "if_needed";
export const QUOTATION_ALWAYS = "always";

export const QUOTATION = {
  if_needed: "if needed",
  always: "always"
};

export const INDENTATION_STRING_SPACES = "spaces";
export const INDENTATION_STRING_TABS = "tabs";

export const IndentationString = {
  spaces: "spaces",
  tabs: "tabs"
};

export const INCLUDE_GENERATED_NAMES_ALWAYS = "always";
export const INCLUDE_GENERATED_NAMES_CUSTOM_NAMES_ONLY = "custom_names_only";
export const INCLUDE_GENERATED_NAMES_NEVER = "never";

export const INCLUDE_GENERATED_NAMES = {
  always: "always",
  custom_names_only: "custom names only",
  never: "never"
};

export const SQL_SETTINGS = {
  WRAP_LINES: "wrapLines",
  WRAP_OFFSET: "wrapOffset",
  INDENT: "indent",
  INDENTATION_STRING: "indentationString",
  INDENTATION_SIZE: "indentationSize",
  LIMIT_ITEMS_ON_LINE: "limitItemsOnLine",
  MAX_LIST_ITEMS_ON_LINE: "maxListItemsOnLine",
  STATEMENT_DELIMITER: "statementDelimiter",
  KEYWORD_CASE: "keywordCase",
  IDENTIFIER_CASE: "identiferCase",
  INCLUDE_SCHEMA: "includeSchema",
  QUOTATION: "quotation",
  ROUTINE_DELIMITER: "routineDelimiter"
};

export const DefaultSqlSettings = {
  wrapLines: true,
  wrapOffset: 80,
  indent: true,
  indentationString: INDENTATION_STRING_SPACES,
  indentationSize: 2,
  limitItemsOnLine: true,
  maxListItemsOnLine: 3,
  statementDelimiter: SEMICOLON,
  routineDelimiter: SEMICOLON,
  keywordCase: KEYWORD_CASE_UPPER,
  identiferCase: IDENTIFIER_CASE_ORIGINAL,
  includeSchema: INCLUDE_SCHEMA_ALWAYS,
  quotation: QUOTATION_IF_NEEDED
};

export const DefaultSqlSettingsPG = {
  ...DefaultSqlSettings,
  includeGeneratedNames: INCLUDE_GENERATED_NAMES_ALWAYS
};

export const DefaultMySqlFamilySqlSettings = {
  wrapLines: true,
  wrapOffset: 80,
  indent: true,
  indentationString: INDENTATION_STRING_SPACES,
  indentationSize: 2,
  limitItemsOnLine: true,
  maxListItemsOnLine: 3,
  statementDelimiter: SEMICOLON,
  routineDelimiter: ROUTINE_DELIMITER,
  keywordCase: KEYWORD_CASE_UPPER,
  identiferCase: IDENTIFIER_CASE_ORIGINAL,
  includeSchema: INCLUDE_SCHEMA_ALWAYS,
  quotation: QUOTATION_IF_NEEDED
};

export class SQLModelToLines {
  constructor(quotation, sqlSettings, defaultContainer) {
    this.quotation = quotation;
    this.sqlSettings = sqlSettings;
    this.defaultContainer = defaultContainer;
  }

  generateLines(item) {
    if (item === undefined) {
      return [];
    }
    switch (item.type) {
      case TokenType.KEYWORD:
        return new KeywordToLines(this, item).generateLines();
      case TokenType.LITERAL:
      case TokenType.CODE:
        return new ValueToLines(this, item).generateLines();
      case TokenType.COMMENT:
        return new CommentToLines(this, item).generateLines();
      case TokenType.QUOTED_LITERAL:
        return new QuotedLiteralToLines(this, item).generateLines();
      case TokenType.IDENTIFIER:
        return new IdentifierToLines(this, item).generateLines();
      case TokenType.QUALIFIED_IDENTIFIER:
        return new QualifiedIdentifierToLines(
          this,
          item,
          this.defaultContainer
        ).generateLines();
      case TokenType.BLOCK:
      case TokenType.STATEMENT:
        return new MultiItemsToLines(
          this,
          item,
          SPACE,
          undefined
        ).generateLines();
      case TokenType.STATEMENTS:
        return new MultiItemsToLines(
          this,
          item,
          EMPTY,
          undefined
        ).generateLines();
      case TokenType.LIST:
        return new MultiItemsToLines(this, item, SPACE, COMMA).generateLines();
      case TokenType.BRACKETS:
        return new BraketsToLines(this, item).generateLines();
      case TokenType.STATEMENT_DELIMITER:
        return new StatementDelimiterToLines(this, item).generateLines();
      case TokenType.STATEMENT_DELIMITER_DEFINE:
        return new StatementDelimiterDefineToLines(this, item).generateLines();
      case TokenType.EMPTY:
      default: {
        return new EmptyToLines(this, item).generateLines();
      }
    }
  }
}
