import {
  BracketType,
  ScopeType
} from "../../../generator/model-to-sql-model/sql_model_builder";

import { ObjectToSQLModel } from "../../../generator/model-to-sql-model/object_to_sql_model";

const NOT_AVAILABLE_CONSTANT = "na";

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
  USING: `USING`,
  ZEROFILL: `ZEROFILL`
};

export class IndexToSQLModel extends ObjectToSQLModel {
  constructor(sqlModelBuilder, finder, generatorOptions, table, index) {
    super(sqlModelBuilder, finder, generatorOptions, table);
    this.index = index;
  }

  getTable() {
    return this.getModelObject();
  }

  getIndex() {
    return this.index;
  }

  usingBlock() {
    return this.sb.block(
      ...(this.getIndex().using !== NOT_AVAILABLE_CONSTANT &&
      this.getIndex().using !== undefined
        ? [this.sb.keyword(KEYWORDS.USING), this.sb.code(this.getIndex().using)]
        : [])
    );
  }

  algorithm() {
    return this.getIndex().algorithm !== NOT_AVAILABLE_CONSTANT &&
      this.getIndex().algorithm !== undefined
      ? [
          this.sb.keyword(KEYWORDS.ALGORITHM),
          this.sb.code(this.getIndex().algorithm)
        ]
      : [];
  }

  lockoption() {
    return this.getIndex().lockoption !== NOT_AVAILABLE_CONSTANT &&
      this.getIndex().lockoption !== undefined
      ? [
          this.sb.keyword(KEYWORDS.LOCK),
          this.sb.code(this.getIndex().lockoption)
        ]
      : [];
  }

  refIndexColumnsBlock() {
    return this.sb.list(
      ...this.getIndex()
        .cols.filter(
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

  objectStatements() {
    return [
      this.sb.statement(
        this.sb.keyword(KEYWORDS.CREATE),
        this.getIndex().unique ? this.sb.keyword(KEYWORDS.UNIQUE) : undefined,
        this.getIndex().fulltext
          ? this.sb.keyword(KEYWORDS.FULLTEXT)
          : undefined,
        this.sb.keyword(KEYWORDS.INDEX),
        this.sb.identifier(this.getIndex().name, false, ScopeType.SUBOBJECT),
        this.usingBlock(),
        this.sb.keyword(KEYWORDS.ON),
        this.sb.qualifiedIdentifier(this.getTable()),
        this.sb.brackets(this.refIndexColumnsBlock(), true, BracketType.ROUND),
        ...this.algorithm(),
        ...this.lockoption(),
        this.sb.statementDelimiter(false)
      )
    ];
  }
}
