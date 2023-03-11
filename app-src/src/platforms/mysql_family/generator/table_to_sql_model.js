import {
  BracketType,
  ScopeType
} from "../../../generator/model-to-sql-model/sql_model_builder";

import { ModelBuilderFactory } from "./generator_sql_mysql_family";
import MySQLFamilyHelpers from "../helpers_mysql_family";
import { ObjectToSQLModel } from "../../../generator/model-to-sql-model/object_to_sql_model";

const NOT_AVAILABLE_CONSTANT = "na";
const NOT_SPECIFIED_CONSTANT = "";
const EQUALS_LITERAL = "=";

const KEYWORDS = {
  ALGORITHM: `ALGORITHM`,
  AUTO_INCREMENT: `AUTO_INCREMENT`,
  BINARY: `BINARY`,
  CHARACTER: `CHARACTER`,
  COLLATE: `COLLATE`,
  COMMENT: `COMMENT`,
  CONSTRAINT: `CONSTRAINT`,
  CREATE: `CREATE`,
  DEFAULT: `DEFAULT`,
  ENGINE: `ENGINE`,
  ENUM: `ENUM`,
  EXISTS: `EXISTS`,
  FULLTEXT: `FULLTEXT`,
  IF: `IF`,
  INDEX: `INDEX`,
  KEY: `KEY`,
  LOCK: `LOCK`,
  NOT: `NOT`,
  NULL: `NULL`,
  ON: `ON`,
  PRIMARY: `PRIMARY`,
  SET: `SET`,
  TABLE: `TABLE`,
  TEMPORARY: `TEMPORARY`,
  UNIQUE: `UNIQUE`,
  UNSIGNED: `UNSIGNED`,
  ZEROFILL: `ZEROFILL`
};

const COLUMN_COMMENT_FIELD = "comment";
const TABLE_COMMENT_FIELD = "desc";

export class TableToSQLModel extends ObjectToSQLModel {
  getTable() {
    return this.obj;
  }

  columnList(adherent) {
    return this.sb.brackets(
      this.sb.list(
        ...this.getTable().cols.map((column) => this.columnBlock(column)),
        ...this.keyList()
      ),
      adherent,
      BracketType.ROUND
    );
  }

  dataType(column) {
    const visibleDataTypeModel = this.visibleDatatype(column);

    const dataTypeIdentifier =
      visibleDataTypeModel?.embeddable === false
        ? this.sb.identifier(
            visibleDataTypeModel.name,
            false,
            ScopeType.SUBOBJECT
          )
        : this.sb.literal(MySQLFamilyHelpers.getJSONType());

    const paramsBrackets = column.param
      ? this.sb.brackets(
          //
          this.sb.literal(column.param),
          true,
          BracketType.ROUND
        )
      : undefined;

    const enumSignature = column.enum
      ? this.sb.block(
          //
          this.sb.keyword(KEYWORDS.ENUM),
          this.sb.brackets(
            //
            this.sb.literal(column.enum),
            true,
            BracketType.ROUND
          )
        )
      : undefined;

    const visibleDataTypeSignature = visibleDataTypeModel
      ? dataTypeIdentifier
      : this.sb.block(this.sb.literal(column.datatype), paramsBrackets);

    return column.enum ? enumSignature : visibleDataTypeSignature;
  }

  columnNotNull(column) {
    return column.nn === true
      ? [this.sb.keyword(KEYWORDS.NOT), this.sb.keyword(KEYWORDS.NULL)]
      : [];
  }

  columnBlock(column) {
    return this.sb.block(
      //
      this.sb.identifier(column.name, false, ScopeType.SUBOBJECT),
      this.dataType(column),
      this.sb.block(
        ...this.parameter(
          [KEYWORDS.CHARACTER, KEYWORDS.SET],
          column.charset,
          true
        ),
        ...this.parameter([KEYWORDS.COLLATE], column.collation, true)
      ),
      column.unsigned && this.sb.block(this.sb.keyword(KEYWORDS.UNSIGNED)),
      column.binary && this.sb.block(this.sb.keyword(KEYWORDS.BINARY)),
      ...this.columnNotNull(column),
      column.zerofill && this.sb.block(this.sb.keyword(KEYWORDS.ZEROFILL)),
      column.autoinc && this.sb.block(this.sb.keyword(KEYWORDS.AUTO_INCREMENT)),
      ...this.objectComment(column, COLUMN_COMMENT_FIELD),
      this.sb.block(
        ...this.parameter([KEYWORDS.DEFAULT], column.defaultvalue, false)
      ),
      this.sb.code(column.after)
    );
  }

  objectComment(obj, commentProperty) {
    return obj[commentProperty]
      ? [
          this.sb.keyword(KEYWORDS.COMMENT),
          this.sb.quotedLiteral(obj[commentProperty])
        ]
      : [];
  }

  refColumns(obj, table) {
    return obj.cols
      .filter((ref) => !!table.cols.find((col) => ref.colid === col.id))
      .map((ref) => table.cols.find((col) => ref.colid === col.id));
  }

  refColumnsInBrackets(key) {
    return this.sb.brackets(
      //
      this.sb.list(
        //
        ...this.refColumns(key, this.getTable()).map((column) =>
          this.sb.identifier(column.name, false, ScopeType.SUBOBJECT)
        )
      ),
      true,
      BracketType.ROUND
    );
  }

  keyName(key) {
    return key.name && key.isPk === false
      ? [
          //
          this.sb.keyword(KEYWORDS.CONSTRAINT),
          this.sb.identifier(key.name, false, ScopeType.SUBOBJECT)
        ]
      : [];
  }

  keyList() {
    return this.getTable().keys
      ? this.getTable()
          .keys.filter((key) => key.cols.length > 0)
          .map((key) =>
            this.sb.block(
              //
              ...this.keyName(key),
              this.keyTypeBlock(key),
              this.refColumnsInBrackets(key)
            )
          )
      : [];
  }

  keyTypeBlock(key) {
    return this.sb.block(
      ...(key.isPk === true
        ? [this.sb.keyword(KEYWORDS.PRIMARY), this.sb.keyword(KEYWORDS.KEY)]
        : [this.sb.keyword(KEYWORDS.UNIQUE)])
    );
  }

  algorithm(index) {
    return index.algorithm !== NOT_AVAILABLE_CONSTANT &&
      index.algorithm !== undefined
      ? [
          this.sb.keyword(KEYWORDS.ALGORITHM),
          this.sb.identifier(index.algorithm)
        ]
      : [];
  }

  lockoption(index) {
    return index.lockoption !== NOT_AVAILABLE_CONSTANT &&
      index.lockoption !== undefined
      ? [
          this.sb.keyword(KEYWORDS.LOCK),
          this.sb.identifier(index.lockoption, false, ScopeType.SUBOBJECT)
        ]
      : [];
  }

  refIndexColumnsBlock(index) {
    return this.sb.list(
      ...index.cols
        .filter(
          (indexColumn) =>
            !!this.getTable().cols.find(
              (tableColumn) => indexColumn.colid === tableColumn.id
            )
        )
        .map((indexColumn) => {
          const existingTableColumn = this.getTable().cols.find(
            (tableColumn) => indexColumn.colid === tableColumn.id
          );
          return this.sb.block(
            this.sb.identifier(
              existingTableColumn.name,
              false,
              ScopeType.SUBOBJECT
            ),
            indexColumn.sort !== undefined
              ? this.sb.keyword(indexColumn.sort)
              : undefined
          );
        })
    );
  }

  indexStatement(index) {
    return this.sb.statement(
      this.sb.keyword(KEYWORDS.CREATE),
      index.unique ? this.sb.keyword(KEYWORDS.UNIQUE) : undefined,
      index.fulltext ? this.sb.keyword(KEYWORDS.FULLTEXT) : undefined,
      this.sb.keyword(KEYWORDS.INDEX),
      this.sb.identifier(index.name, false, ScopeType.SUBOBJECT),
      this.sb.keyword(KEYWORDS.ON),
      this.sb.qualifiedIdentifier(this.getTable()),
      this.sb.brackets(
        this.refIndexColumnsBlock(index),
        true,
        BracketType.ROUND
      ),
      ...this.algorithm(index),
      ...this.lockoption(index),
      this.sb.statementDelimiter(false)
    );
  }

  indexesStatement() {
    return this.generatorOptions.generateNested === true
      ? this.getTable().indexes.map((index) => {
          const modelGenerator = ModelBuilderFactory.createIndexToSQLModel(
            this.sb,
            this.finder,
            this.generatorOptions,
            this.getTable(),
            index
          );
          return modelGenerator.convert();
        })
      : [];
  }

  tabletype(table) {
    return table.tabletype !== NOT_AVAILABLE_CONSTANT && table.tabletype !== NOT_SPECIFIED_CONSTANT &&
      table.tabletype !== undefined
      ? this.sb.block(
          this.sb.keyword(KEYWORDS.ENGINE),
          this.sb.literal(EQUALS_LITERAL),
          this.sb.literal(table.tabletype)
        )
      : undefined;
  }

  initautoinc(table) {
    return table.initautoinc
      ? this.sb.block(
          this.sb.keyword(KEYWORDS.AUTO_INCREMENT),
          this.sb.literal(EQUALS_LITERAL),
          this.sb.literal(table.initautoinc)
        )
      : undefined;
  }

  charset(table) {
    return table.charset
      ? this.sb.block(
          this.sb.keyword(KEYWORDS.DEFAULT),
          this.sb.keyword(KEYWORDS.CHARACTER),
          this.sb.keyword(KEYWORDS.SET),
          this.sb.literal(EQUALS_LITERAL),
          this.sb.identifier(table.charset, true, ScopeType.SUBOBJECT)
        )
      : undefined;
  }

  collation(table) {
    return table.collation
      ? this.sb.block(
          this.sb.keyword(KEYWORDS.COLLATE),
          this.sb.literal(EQUALS_LITERAL),
          this.sb.identifier(table.collation, true, ScopeType.SUBOBJECT)
        )
      : undefined;
  }

  ifNotExists() {
    return this.getTable().ifnotexists
      ? [
          this.sb.keyword(KEYWORDS.IF),
          this.sb.keyword(KEYWORDS.NOT),
          this.sb.keyword(KEYWORDS.EXISTS)
        ]
      : [];
  }

  objectStatements() {
    return [
      this.sb.statement(
        //
        this.sb.code(this.getTable().beforeScript)
      ),
      //
      this.sb.statement(
        //
        this.sb.keyword(KEYWORDS.CREATE),
        this.getTable().temporary && this.sb.keyword(KEYWORDS.TEMPORARY),
        this.sb.keyword(KEYWORDS.TABLE),
        ...this.ifNotExists(),
        this.sb.qualifiedIdentifier(this.getTable()),
        this.columnList(true),
        ...this.objectComment(this.getTable(), TABLE_COMMENT_FIELD),
        this.tabletype(this.getTable()),
        this.initautoinc(this.getTable()),
        this.charset(this.getTable()),
        this.collation(this.getTable()),
        this.sb.statementDelimiter(false)
      ),
      ...this.indexesStatement(),
      this.sb.statement(
        //
        this.sb.code(this.getTable().afterScript)
      )
    ];
  }

  visibleDatatype(column) {
    return this.finder.model.tables[column.datatype];
  }
}
