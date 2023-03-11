import {
  BracketType,
  ScopeType
} from "../../../generator/model-to-sql-model/sql_model_builder";
import {
  INCLUDE_GENERATED_NAMES_ALWAYS,
  INCLUDE_GENERATED_NAMES_CUSTOM_NAMES_ONLY
} from "../../../generator/sql-model-to-lines/model_to_lines";

import { ModelBuilderFactory } from "./generator_sql_pg";
import { ObjectToSQLModel } from "../../../generator/model-to-sql-model/object_to_sql_model";
import PGHelpers from "../helpers_pg";

const KEYWORDS = {
  CREATE: `CREATE`,
  TYPE: `TYPE`,
  AS: `AS`,
  GENERATED: `GENERATED`,
  ALWAYS: `ALWAYS`,
  IDENTITY: `IDENTITY`,
  BY: `BY`,
  DEFAULT: `DEFAULT`,
  TABLE: `TABLE`,
  TABLESPACE: `TABLESPACE`,
  PARTITION: `PARTITION`,
  INHERITS: `INHERITS`,
  ON: `ON`,
  INDEX: `INDEX`,
  UNIQUE: `UNIQUE`,
  NULLS: `NULLS`,
  LAST: `LAST`,
  DESC: `DESC`,
  COLLATE: `COLLATE`,
  WITH: `WITH`,
  PRIMARY: `PRIMARY`,
  KEY: `KEY`,
  CONSTRAINT: `CONSTRAINT`,
  COLUMN: `COLUMN`,
  SECURITY: `SECURITY`,
  LEVEL: `LEVEL`,
  ROW: `ROW`,
  ENABLE: `ENABLE`,
  ALTER: `ALTER`,
  COMMENT: `COMMENT`,
  IS: `IS`,
  NOT: `NOT`,
  NULL: `NULL`,
  GIST: `GIST`,
  HASH: `HASH`
};
export class TableToSQLModelPG extends ObjectToSQLModel {
  constructor(
    sqlModelBuilder,
    finder,
    generatorOptions,
    obj,
    tableNameGenerator
  ) {
    super(sqlModelBuilder, finder, generatorOptions, obj);
    this.tableNameGenerator = tableNameGenerator;
  }

  getTable() {
    return this.obj;
  }

  objectStatements() {
    return this.getTable().objectType === "composite"
      ? this.convertCompositeCreateType()
      : this.convertStandardCreateTable();
  }

  convertCompositeCreateType() {
    return [
      this.sb.statement(
        //
        this.sb.code(this.getTable().beforeScript)
      ),
      //
      this.sb.statement(
        //
        this.sb.keyword(KEYWORDS.CREATE),
        this.sb.keyword(KEYWORDS.TYPE),
        this.sb.qualifiedIdentifier(this.getTable()),
        this.sb.keyword(KEYWORDS.AS),
        this.columnAndKeyList(false),
        this.sb.statementDelimiter(false)
      ),
      ...this.columnsCommentStatements(),
      this.commentStatement(
        KEYWORDS.TYPE,
        this.sb.qualifiedIdentifier(this.getTable()),
        this.getTable().desc
      ),
      this.sb.statement(
        //
        this.sb.code(this.getTable().afterScript)
      )
    ];
  }

  columnAndKeyList(adherent) {
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
    const visibleDataType = this.visibleDatatype(column);
    const isCompositeEnumTypeOther =
      visibleDataType &&
      (visibleDataType.objectType === "composite" ||
        visibleDataType.type === "Enum" ||
        visibleDataType.type === "Domain" ||
        visibleDataType.type === "TypeOther");

    const dataTypeName =
      isCompositeEnumTypeOther === true
        ? this.sb.identifier(visibleDataType.name, false, ScopeType.SUBOBJECT)
        : this.sb.literal(PGHelpers.getJSONType(), false, ScopeType.SUBOBJECT);

    const paramsSignature = column.param
      ? this.sb.brackets(
          //
          this.sb.literal(column.param),
          true,
          BracketType.ROUND
        )
      : undefined;
    const arraySignature =
      column.list === true
        ? this.sb.brackets(
            //
            this.sb.empty(),
            true,
            BracketType.SQUARE
          )
        : undefined;

    return visibleDataType
      ? dataTypeName
      : this.sb.block(
          //
          this.sb.literal(column.datatype),
          paramsSignature,
          arraySignature
        );
  }

  generatedIdentityBlock(column) {
    switch (column.pg?.generatedIdentity) {
      case "always": {
        return this.sb.block(
          //
          this.sb.keyword(KEYWORDS.GENERATED),
          this.sb.keyword(KEYWORDS.ALWAYS),
          this.sb.keyword(KEYWORDS.AS),
          this.sb.keyword(KEYWORDS.IDENTITY)
        );
      }
      case "default": {
        return this.sb.block(
          //
          this.sb.keyword(KEYWORDS.GENERATED),
          this.sb.keyword(KEYWORDS.BY),
          this.sb.keyword(KEYWORDS.DEFAULT),
          this.sb.keyword(KEYWORDS.AS),
          this.sb.keyword(KEYWORDS.IDENTITY)
        );
      }
      default: {
        return undefined;
      }
    }
  }

  columnNotNull(column) {
    return column.nn === true
      ? [this.sb.keyword(`NOT`), this.sb.keyword(`NULL`)]
      : [];
  }

  columnBlock(column) {
    return this.sb.block(
      //
      this.sb.identifier(column.name, false, ScopeType.SUBOBJECT),
      this.dataType(column),
      ...this.columnNotNull(column),
      this.sb.block(
        ...this.parameter([KEYWORDS.DEFAULT], column.defaultvalue, false),
        ...this.parameter([KEYWORDS.COLLATE], column.collation, true)
      ),
      this.generatedIdentityBlock(column),
      this.sb.code(column.after)
    );
  }

  commentStatement(type, qualifiedIdentifier, comment) {
    return !!comment
      ? this.sb.statement(
          this.sb.keyword(KEYWORDS.COMMENT),
          this.sb.keyword(KEYWORDS.ON),
          this.sb.keyword(type),
          qualifiedIdentifier,
          this.sb.keyword(KEYWORDS.IS),
          this.sb.quotedLiteral(comment),
          this.sb.statementDelimiter(false)
        )
      : undefined;
  }

  rowSecurityStatement() {
    return !!this.getTable().pg?.rowsecurity
      ? this.sb.statement(
          this.sb.keyword(KEYWORDS.ALTER),
          this.sb.keyword(KEYWORDS.TABLE),
          this.sb.qualifiedIdentifier(this.getTable()),
          this.sb.keyword(KEYWORDS.ENABLE),
          this.sb.keyword(KEYWORDS.ROW),
          this.sb.keyword(KEYWORDS.LEVEL),
          this.sb.keyword(KEYWORDS.SECURITY),
          this.sb.statementDelimiter(false)
        )
      : undefined;
  }

  qualifiedIdentifier(obj, innerObj) {
    return this.sb.qualifiedIdentifierInner(obj, innerObj);
  }

  qualifiedIdentifierOnlyInner(obj, innerObj) {
    return this.sb.qualifiedIdentifierOnlyInner(obj, innerObj);
  }

  columnsCommentStatements() {
    return this.getTable()
      .cols.filter((column) => !!column.comment)
      .map((column) =>
        this.commentStatement(
          KEYWORDS.COLUMN,
          this.qualifiedIdentifier(this.getTable(), column),
          column.comment
        )
      );
  }

  indexesCommentStatements() {
    return this.generatorOptions.generateNested === true
      ? this.getTable()
          .indexes.filter((index) => !!index.pg.desc)
          .map((index) =>
            this.commentStatement(
              KEYWORDS.INDEX,
              this.qualifiedIdentifierOnlyInner(this.getTable(), index),
              index.pg.desc
            )
          )
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

  isKeyNameAutoGenerated(table, key) {
    return PGHelpers.makeKeyName(key, table, this.finder.tables) !== key.name;
  }

  shouldAddKeyName(table, key) {
    switch (this.generatorOptions.includeGeneratedNames) {
      case INCLUDE_GENERATED_NAMES_ALWAYS:
        return !!key.name;
      case INCLUDE_GENERATED_NAMES_CUSTOM_NAMES_ONLY:
        return this.isKeyNameAutoGenerated(table, key);
      default:
        return false;
    }
  }

  keyName(table, key) {
    return this.shouldAddKeyName(table, key)
      ? [
          this.sb.keyword(`CONSTRAINT`),
          this.sb.identifier(key.name, false, ScopeType.SUBOBJECT)
        ]
      : [];
  }

  keyList() {
    return this.getTable().keys
      ? this.getTable()
          .keys.filter((key) => key.cols.length > 0)
          .map((key) =>
            key.isPk
              ? this.sb.block(
                  //
                  ...this.keyName(this.getTable(), key),
                  this.sb.keyword(KEYWORDS.PRIMARY),
                  this.sb.keyword(KEYWORDS.KEY),
                  this.refColumnsInBrackets(key)
                )
              : this.sb.block(
                  //
                  ...this.keyName(this.getTable(), key),
                  this.sb.keyword(KEYWORDS.UNIQUE),
                  this.refColumnsInBrackets(key)
                )
          )
      : [];
  }

  indexesStatement() {
    const x =
      this.generatorOptions.generateNested === true
        ? this.getTable().indexes.map((index) => {
            const modelGenerator = ModelBuilderFactory.createIndexToSQLModel(
              this.sb,
              this.finder,
              this.generatorOptions,
              this.getTable(),
              index,
              this.tableNameGenerator
            );
            const c = modelGenerator.convert();
            return c;
          })
        : [];
    return x;
  }

  inherits() {
    return !!this.getTable().pg?.inherits
      ? [
          //
          this.sb.keyword(KEYWORDS.INHERITS),
          this.sb.brackets(
            this.sb.literal(this.getTable().pg.inherits),
            true,
            BracketType.ROUND
          )
        ]
      : [];
  }

  storageParams(storageParameters) {
    return storageParameters && storageParameters !== ""
      ? [
          this.sb.keyword(KEYWORDS.WITH),
          this.sb.brackets(
            //
            this.sb.literal(storageParameters),
            true,
            BracketType.ROUND
          )
        ]
      : [];
  }

  convertStandardCreateTable() {
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
        ...this.inherits(),
        ...this.storageParams(this.getTable().pg?.storageParameters),
        ...this.parameter(
          [KEYWORDS.TABLESPACE],
          this.getTable().pg?.tablespace,
          false
        ),
        ...this.parameter(
          [KEYWORDS.PARTITION],
          this.getTable().pg?.partition,
          false
        ),
        this.sb.statementDelimiter(false)
      ),
      ...this.indexesStatement(),
      this.rowSecurityStatement(),
      ...this.columnsCommentStatements(),
      this.commentStatement(
        KEYWORDS.TABLE,
        this.sb.qualifiedIdentifier(this.getTable()),
        this.getTable().desc
      ),
      this.sb.statement(
        //
        this.sb.code(this.getTable().afterScript)
      )
    ];
  }

  visibleDatatype(column) {
    let datatype = this.finder.model.tables[column.datatype];
    if (!datatype) {
      datatype = this.finder.model.otherObjects[column.datatype];
    }
    return datatype;
  }
}
