import {
  BracketType,
  ScopeType
} from "../../../generator/model-to-sql-model/sql_model_builder";
import {
  INCLUDE_GENERATED_NAMES_ALWAYS,
  INCLUDE_GENERATED_NAMES_CUSTOM_NAMES_ONLY,
  INCLUDE_SCHEMA_ALWAYS,
  INCLUDE_SCHEMA_WHEN_DIFFERS
} from "../../../generator/sql-model-to-lines/model_to_lines";

import MSSQLHelpers from "../helpers_mssql";
import { ModelBuilderFactory } from "./generator_sql_mssql";
import { ObjectToSQLModel } from "../../../generator/model-to-sql-model/object_to_sql_model";
import { OtherObjectTypes } from "common";
import _ from "lodash";

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
  HASH: `HASH`,
  CLUSTERED: `CLUSTERED`,
  NONCLUSTERED: `NONCLUSTERED`,
  WHERE: `WHERE`,
  SPATIAL: `SPATIAL`,
  XML: `XML`,
  FOR: `FOR`,
  PATH: `PATH`,
  FULLTEXT: `FULLTEXT`,
  ORDER: `ORDER`
};
export class TableToSQLModelMSSQL extends ObjectToSQLModel {
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
    return this.convertStandardCreateTable();
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
    const isTypeOther =
      visibleDataType &&
      visibleDataType.type === OtherObjectTypes.UserDefinedType;

    const dataTypeName =
      isTypeOther === true
        ? this.sb.qualifiedIdentifier(visibleDataType)
        : this.sb.literal(
            MSSQLHelpers.getJSONType(),
            false,
            ScopeType.SUBOBJECT
          );

    const paramsSignature = column.param
      ? this.sb.brackets(
          //
          this.sb.literal(column.param),
          true,
          BracketType.ROUND
        )
      : undefined;
    return visibleDataType
      ? dataTypeName
      : this.sb.block(
          //
          this.sb.literal(column.datatype),
          paramsSignature
        );
  }

  columnNotNull(column, computed) {
    return column.nn === true && _.isEmpty(computed)
      ? [this.sb.keyword(`NOT`), this.sb.keyword(`NULL`)]
      : [];
  }

  columnBlock(column) {
    const computed = column.mssql.computed;
    return this.sb.block(
      //
      this.sb.identifier(column.name, false, ScopeType.SUBOBJECT),
      _.isEmpty(computed)
        ? this.dataType(column)
        : this.sb.statement(
            this.sb.keyword(KEYWORDS.AS),
            this.sb.code(column.mssql.computed)
          ),
      this.sb.block(
        ...this.parameter(
          [KEYWORDS.DEFAULT],
          column.defaultvalue,
          false,
          false
        ),
        ...(!this.finder.model.otherObjects[column.datatype]
          ? this.parameter([KEYWORDS.COLLATE], column.collation, false, true)
          : [])
      ),
      ...this.columnNotNull(column, computed),
      this.sb.code(column.after)
    );
  }

  getSchema() {
    if (this.generatorOptions.includeSchema === INCLUDE_SCHEMA_ALWAYS) {
      return !_.isEmpty(this.getTable().mssql.schema)
        ? this.getTable().mssql.schema
        : undefined;
    }
    if (this.generatorOptions.includeSchema === INCLUDE_SCHEMA_WHEN_DIFFERS) {
      const tableSchema = this.getTable().mssql.schema;
      const projectSchema = this.finder.model.model.mssql.schema;
      if (!_.isEmpty(tableSchema)) {
        return tableSchema;
      }
      if (!_.isEmpty(projectSchema)) {
        return projectSchema;
      }
    }

    return undefined;
  }

  commentStatement(type, innerObjectName, comment) {
    const schema = this.getSchema();
    if (!!schema && !_.isEmpty(comment)) {
      const tableName = this.getTable().name;
      switch (type) {
        case KEYWORDS.COLUMN:
          return this.sb.statement(
            this.sb.code(`EXEC sys.sp_addextendedproperty`),
            this.sb.block(
              this.sb.code(`'MS_Description',`),
              this.sb.code(`N'${comment.replaceAll("'", "''")}',`),
              this.sb.code(`'schema', N'${schema}',`),
              this.sb.code(`'table', N'${tableName}',`),
              this.sb.code(`'column', N'${innerObjectName}';`)
            ),
            this.sb.statementDelimiterNewLine()
          );
        case KEYWORDS.CONSTRAINT:
          return this.sb.statement(
            this.sb.code(`EXEC sys.sp_addextendedproperty`),
            this.sb.block(
              this.sb.code(`'MS_Description',`),
              this.sb.code(`N'${comment.replaceAll("'", "''")}',`),
              this.sb.code(`'schema', N'${schema}',`),
              this.sb.code(`'table', N'${tableName}',`),
              this.sb.code(`'constraint', N'${innerObjectName}';`)
            ),
            this.sb.statementDelimiterNewLine()
          );
        case KEYWORDS.TABLE:
          return this.sb.statement(
            this.sb.code(`EXEC sys.sp_addextendedproperty`),
            this.sb.block(
              this.sb.code(`'MS_Description',`),
              this.sb.code(`N'${comment.replaceAll("'", "''")}',`),
              this.sb.code(`'schema', N'${schema}',`),
              this.sb.code(`'table', N'${tableName}';`)
            ),
            this.sb.statementDelimiterNewLine()
          );
        default:
          return undefined;
      }
    }
    return undefined;
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
        this.commentStatement(KEYWORDS.COLUMN, column.name, column.comment)
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

  isKeyNameAutoGenerated(table, key) {
    return (
      MSSQLHelpers.makeKeyName(key, table, this.finder.tables) !== key.name
    );
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
                  key.mssql?.clustered
                    ? undefined
                    : this.sb.keyword(KEYWORDS.NONCLUSTERED),
                  this.refColumnsInBrackets(key)
                )
              : this.sb.block(
                  //
                  ...this.keyName(this.getTable(), key),
                  this.sb.keyword(KEYWORDS.UNIQUE),
                  key.mssql?.clustered
                    ? undefined
                    : this.sb.keyword(KEYWORDS.NONCLUSTERED),
                  this.refColumnsInBrackets(key)
                )
          )
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
        this.sb.statementDelimiterNewLine()
      ),
      ...this.indexesStatement(),

      ...this.columnsCommentStatements(),
      this.commentStatement(
        KEYWORDS.TABLE,
        this.getTable().name,
        this.getTable().desc
      ),
      this.sb.statement(
        //
        this.sb.code(this.getTable().afterScript)
      )
    ];
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

  visibleDatatype(column) {
    let datatype = this.finder.model.tables[column.datatype];
    if (!datatype) {
      datatype = this.finder.model.otherObjects[column.datatype];
    }
    return datatype;
  }
}
