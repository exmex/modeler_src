import {
  BracketType,
  ScopeType
} from "../../../generator/model-to-sql-model/sql_model_builder";

import { ModelBuilderFactory } from "./generator_sql_sqlite";
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
  WITHOUT: `WITHOUT`,
  STRICT: `STRICT`
};

export class TableToSQLModel extends ObjectToSQLModel {
  constructor(sqlModelBuilder, finder, generatorOptions, obj) {
    super(sqlModelBuilder, finder, generatorOptions, obj);

    this.keyBlock = this.keyBlock.bind(this);
    this.relationConstraint = this.relationConstraint.bind(this);
  }

  getTable() {
    return this.obj;
  }

  columnAndKeyList(adherent) {
    return this.sb.brackets(
      this.sb.list(
        ...this.getTable().cols.map((column) => this.columnBlock(column)),
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
          .map((key) => this.finder.model.relations[key])
          .filter((relation) => relation.child === this.getTable().id)
          .map(this.relationConstraint)
      : [];
  }

  keyList() {
    return this.getTable().keys
      ? this.getTable()
          .keys.filter((key) => key.cols.length > 0)
          .map(this.keyBlock)
      : [];
  }

  keyBlock(key) {
    return key.isPk ? this.pkOrAutoIncrementKey(key) : this.uniqueKeyBlock(key);
  }

  pkOrAutoIncrementKey(key) {
    const autoincrementValue = !!this.getTable().cols.find((col) =>
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

  withoutRowId() {
    return this.getTable().sqlite && this.getTable().sqlite.withoutrowid
      ? [this.sb.keyword(KEYWORDS.WITHOUT), this.sb.keyword(KEYWORDS.ROWID)]
      : [];
  }

  strict() {
    return this.getTable().sqlite && this.getTable().sqlite.strict
      ? [this.sb.keyword(KEYWORDS.STRICT)]
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
        this.sb.keyword(KEYWORDS.TABLE),
        this.sb.qualifiedIdentifier(this.getTable()),
        this.columnAndKeyList(true),
        ...this.withoutRowId(),
        ...this.strict(),
        this.sb.statementDelimiter(false)
      ),
      ...this.indexesStatement(),
      this.sb.statement(
        //
        this.sb.code(this.getTable().beforeScript)
      )
    ];
  }

  visibleDatatype(column) {
    return this.finder.model.tables[column.datatype];
  }
}
