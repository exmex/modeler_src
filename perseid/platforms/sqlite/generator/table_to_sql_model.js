import {
  BracketType,
  ScopeType
} from "../../../generator/model-to-sql-model/sql_model_builder";

import { ObjectToSQLModel } from "../../../generator/model-to-sql-model/object_to_sql_model";
import { RelationToSQLModel } from "../../../generator/model-to-sql-model/relation_to_sql_model";
import SQLiteHelpers from "../helpers_sqlite";

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

export class TableToSQLModel extends ObjectToSQLModel {
  constructor(sqlModelBuilder, finder, generatorOptions, obj) {
    super(sqlModelBuilder, finder, generatorOptions, obj);

    this.keyBlock = this.keyBlock.bind(this);
    this.relationConstraint = this.relationConstraint.bind(this);
  }

  get table() {
    return this.obj;
  }

  columnAndKeyList(adherent) {
    return this.sb.brackets(
      this.sb.list(
        ...this.table.cols.map(column => this.columnBlock(column)),
        ...this.keyList(),
        ...this.relationsEndingInTableConstraints()
      ),
      adherent,
      BracketType.ROUND
    );
  }

  dataType(column) {
    const visibleDataTypeModel = this.visibleDatatype(column);

    const dataTypeName =
      visibleDataTypeModel?.embeddable === false
        ? this.sb.identifier(
            visibleDataTypeModel.name,
            false,
            ScopeType.SUBOBJECT
          )
        : this.sb.literal(SQLiteHelpers.getJSONType());

    const paramsSignature = column.param
      ? this.sb.brackets(
          //
          this.sb.literal(column.param),
          true,
          BracketType.ROUND
        )
      : undefined;

    return visibleDataTypeModel
      ? dataTypeName
      : this.sb.block(
          //
          this.sb.literal(column.datatype),
          paramsSignature
        );
  }

  columnNotNull(column) {
    return column.nn === true
      ? [this.sb.keyword(KEYWORDS.NOT), this.sb.keyword(KEYWORDS.NULL)]
      : [];
  }

  primaryKeyAutoIncrement(column) {
    return column.datatype === KEYWORDS.INTEGER &&
      column.sqlite &&
      column.sqlite.autoincrement
      ? [
          this.sb.keyword(KEYWORDS.PRIMARY),
          this.sb.keyword(KEYWORDS.KEY),
          this.sb.keyword(KEYWORDS.AUTOINCREMENT)
        ]
      : [];
  }

  columnBlock(column) {
    return this.sb.block(
      //
      this.sb.identifier(column.name, false, ScopeType.SUBOBJECT),
      this.dataType(column),
      ...this.primaryKeyAutoIncrement(column),
      ...this.columnNotNull(column),
      ...this.parameter([KEYWORDS.DEFAULT], column.defaultvalue, false),
      ...this.parameter([KEYWORDS.COLLATE], column.collation, true),
      this.sb.code(column.after)
    );
  }

  refColumns(obj, table) {
    return obj.cols
      .filter(ref => !!table.cols.find(col => ref.colid === col.id))
      .map(ref => table.cols.find(col => ref.colid === col.id));
  }

  refColumnsInBrackets(key) {
    return this.sb.brackets(
      //
      this.sb.list(
        //
        ...this.refColumns(key, this.table).map(column =>
          this.sb.identifier(column.name, false, ScopeType.SUBOBJECT)
        )
      ),
      true,
      BracketType.ROUND
    );
  }

  keyName(key) {
    return key.name
      ? [
          //
          this.sb.keyword(KEYWORDS.CONSTRAINT),
          this.sb.identifier(key.name, false, ScopeType.SUBOBJECT)
        ]
      : [];
  }

  relationConstraint(relation) {
    return this.sb.block(
      ...new RelationToSQLModel(
        this.sb,
        this.finder,
        this.generatorOptions,
        relation
      ).constraint()
    );
  }

  relationsEndingInTableConstraints() {
    return this.finder.model.relations
      ? Object.keys(this.finder.model.relations)
          .map(key => this.finder.model.relations[key])
          .filter(relation => relation.child === this.table.id)
          .map(this.relationConstraint)
      : [];
  }

  keyList() {
    return this.table.keys
      ? this.table.keys.filter(key => key.cols.length > 0).map(this.keyBlock)
      : [];
  }

  keyBlock(key) {
    return key.isPk ? this.pkOrAutoIncrementKey(key) : this.uniqueKeyBlock(key);
  }

  pkOrAutoIncrementKey(key) {
    const autoincrementValue = !!this.table.cols.find(col =>
      col.sqlite && col.sqlite.autoincrement ? true : false
    );

    return !autoincrementValue ? this.pkKeyBlock(key) : undefined;
  }

  pkKeyBlock(key) {
    return this.sb.block(
      //
      this.sb.keyword(KEYWORDS.PRIMARY),
      this.sb.keyword(KEYWORDS.KEY),
      this.refColumnsInBrackets(key)
    );
  }

  uniqueKeyBlock(key) {
    return this.sb.block(
      //
      ...this.keyName(key),
      this.sb.keyword(KEYWORDS.UNIQUE),
      this.refColumnsInBrackets(key)
    );
  }

  indexColumnCollate(indexColumn) {
    return indexColumn.sqlite && indexColumn.sqlite.collate;
  }

  indexColumnExpression(indexColumn) {
    return indexColumn.sqlite && indexColumn.sqlite.expression;
  }

  refIndexColumnsBlock(obj) {
    return this.sb.list(
      ...obj.cols
        .filter(
          indexColumn =>
            !!this.table.cols.find(
              tableColumn => indexColumn.colid === tableColumn.id
            ) || !!this.indexColumnExpression(indexColumn)
        )
        .map(indexColumn => {
          const existingTableColumn = this.table.cols.find(
            tableColumn => indexColumn.colid === tableColumn.id
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
    );
  }

  isIndexColumnDesc(indexColumn) {
    return indexColumn.sqlite && indexColumn.sqlite.desc ? true : false;
  }

  indexStatement(index) {
    return this.sb.statement(
      this.sb.keyword(KEYWORDS.CREATE),
      index.unique ? this.sb.keyword(KEYWORDS.UNIQUE) : undefined,
      this.sb.keyword(KEYWORDS.INDEX),
      this.sb.identifier(index.name, false, ScopeType.SUBOBJECT),
      this.sb.keyword(KEYWORDS.ON),
      this.sb.qualifiedIdentifier(this.table),
      this.sb.brackets(
        this.refIndexColumnsBlock(index),
        true,
        BracketType.ROUND
      ),
      this.sb.statementDelimiter(false)
    );
  }

  indexExpression(index) {
    return index.sqlite && index.sqlite.expression;
  }

  indexesStatement() {
    return this.table.indexes.map(index =>
      !!this.indexExpression(index)
        ? this.sb.statement(this.sb.code(this.indexExpression(index)))
        : this.indexStatement(index)
    );
  }

  withoutRowId() {
    return this.table.sqlite && this.table.sqlite.withoutrowid
      ? [this.sb.keyword(KEYWORDS.WITHOUT), this.sb.keyword(KEYWORDS.ROWID)]
      : [];
  }

  objectStatements() {
    return [
      this.sb.statement(
        //
        this.sb.code(this.table.beforeScript)
      ),
      //
      this.sb.statement(
        //
        this.sb.keyword(KEYWORDS.CREATE),
        this.sb.keyword(KEYWORDS.TABLE),
        this.sb.qualifiedIdentifier(this.table),
        this.columnAndKeyList(true),
        ...this.withoutRowId(),
        this.sb.statementDelimiter(false)
      ),
      ...this.indexesStatement(),
      this.sb.statement(
        //
        this.sb.code(this.table.beforeScript)
      )
    ];
  }

  visibleDatatype(column) {
    return this.finder.model.tables[column.datatype];
  }
}
