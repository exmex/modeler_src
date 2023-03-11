import {
  BracketType,
  ScopeType
} from "../../../generator/model-to-sql-model/sql_model_builder";

import { ObjectToSQLModel } from "../../../generator/model-to-sql-model/object_to_sql_model";

const KEYWORDS = {
  AUTOINCREMENT: `AUTOINCREMENT`,
  COLLATE: `COLLATE`,
  CONSTRAINT: `CONSTRAINT`,
  CREATE: `CREATE`,
  DEFAULT: `DEFAULT`,
  DESC: `DESC`,
  INDEX: `INDEX`,
  INTEGER: `INTEGER`,
  KEY: `KEY`,
  NOT: `NOT`,
  NULL: `NULL`,
  ON: `ON`,
  PRIMARY: `PRIMARY`,
  ROWID: `ROWID`,
  TABLE: `TABLE`,
  UNIQUE: `UNIQUE`,
  WITHOUT: `WITHOUT`
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

  indexColumnCollate(indexColumn) {
    return indexColumn.sqlite && indexColumn.sqlite.collate;
  }

  indexColumnExpression(indexColumn) {
    return indexColumn.sqlite && indexColumn.sqlite.expression;
  }

  refIndexColumnsBlock() {
    return this.getTable().cols
      ? this.sb.list(
          ...this.getIndex()
            .cols.filter(
              (indexColumn) =>
                !!this.getTable().cols.find(
                  (tableColumn) => indexColumn.colid === tableColumn.id
                ) || !!this.indexColumnExpression(indexColumn)
            )
            .map((indexColumn) => {
              const existingTableColumn = this.getTable().cols.find(
                (tableColumn) => indexColumn.colid === tableColumn.id
              );
              return this.sb.block(
                !!this.indexColumnExpression(indexColumn)
                  ? this.sb.code(indexColumn.sqlite.expression)
                  : this.sb.identifier(
                      existingTableColumn.name,
                      false,
                      ScopeType.SUBOBJECT
                    ),
                ...this.parameter(
                  [KEYWORDS.COLLATE],
                  this.indexColumnCollate(indexColumn),
                  true
                ),
                this.isIndexColumnDesc(indexColumn)
                  ? this.sb.keyword(KEYWORDS.DESC)
                  : undefined
              );
            })
        )
      : [];
  }

  isIndexColumnDesc(indexColumn) {
    return indexColumn.sqlite && indexColumn.sqlite.desc ? true : false;
  }

  indexStatement() {
    return this.sb.statement(
      this.sb.keyword(KEYWORDS.CREATE),
      this.getIndex().unique ? this.sb.keyword(KEYWORDS.UNIQUE) : undefined,
      this.sb.keyword(KEYWORDS.INDEX),
      this.sb.identifier(this.getIndex().name, false, ScopeType.SUBOBJECT),
      this.sb.keyword(KEYWORDS.ON),
      this.sb.qualifiedIdentifier(this.getTable()),
      this.sb.brackets(this.refIndexColumnsBlock(), true, BracketType.ROUND),
      this.sb.statementDelimiter(false)
    );
  }

  indexExpression() {
    return this.getIndex().sqlite && this.getIndex().sqlite.expression;
  }

  objectStatements() {
    return [
      //
      this.sb.statement(
        //
        !!this.indexExpression()
          ? this.sb.code(this.indexExpression())
          : this.indexStatement()
      )
    ];
  }
}
