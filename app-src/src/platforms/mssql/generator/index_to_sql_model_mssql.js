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

import MSSQLHelpers from "../../mssql/helpers_mssql";
import { ObjectToSQLModel } from "../../../generator/model-to-sql-model/object_to_sql_model";
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
  USING: `USING`,
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

export class IndexToSQLModelMSSQL extends ObjectToSQLModel {
  constructor(
    sqlModelBuilder,
    finder,
    generatorOptions,
    table,
    index,
    tableNameGenerator
  ) {
    super(sqlModelBuilder, finder, generatorOptions, table);
    this.index = index;
    this.tableNameGenerator = tableNameGenerator;
  }

  getTable() {
    return this.getModelObject();
  }

  getIndex() {
    return this.index;
  }

  objectStatements() {
    return [...this.indexStatement(), ...this.indexCommentStatement()];
  }

  indexStatement() {
    if (!_.find(this.getIndex().cols, (col) => col.colid !== "0")) {
      return [];
    }
    switch (this.getIndex().mssql.type) {
      case "RELATIONAL":
        return [
          this.indexRelationalStatement(this.getTable(), this.getIndex())
        ];
      case "SPATIAL":
        return [this.indexSpatialStatement(this.getTable(), this.getIndex())];
      case "XML":
        return [this.indexXMLStatement(this.getTable(), this.getIndex())];
      case "FULLTEXT":
        return [this.indexFulltextStatement(this.getTable(), this.getIndex())];
      case "COLUMNSTORE":
        return [
          this.indexColumnStoredStatement(this.getTable(), this.getIndex())
        ];
      default:
        return [];
    }
  }

  indexRelationalStatement(table, index) {
    return this.sb.statement(
      this.sb.statement(
        this.sb.keyword(KEYWORDS.CREATE),
        index.unique ? this.sb.keyword(KEYWORDS.UNIQUE) : undefined,
        index.mssql.clustered === false
          ? this.sb.keyword(KEYWORDS.NONCLUSTERED)
          : undefined,
        this.sb.keyword(KEYWORDS.INDEX),
        ...this.indexName(table, index),
        ...this.indexOn(index),
        ...this.indexWhere(index),
        this.indexWith(index),
        ...this.indexOnFilegroup(index),
        this.sb.statementDelimiterNewLine()
      )
    );
  }

  indexSpatialStatement(table, index) {
    return this.sb.statement(
      this.sb.statement(
        this.sb.keyword(KEYWORDS.CREATE),
        this.sb.keyword(KEYWORDS.SPATIAL),
        this.sb.keyword(KEYWORDS.INDEX),
        ...this.indexName(table, index),
        ...this.indexOn(index),
        ...this.indexUsing(index),
        this.indexWith(index),
        ...this.indexOnFilegroup(index),
        this.sb.statementDelimiterNewLine()
      )
    );
  }

  indexXMLStatement(table, index) {
    return this.sb.statement(
      this.sb.statement(
        this.sb.keyword(KEYWORDS.CREATE),
        index.mssql.primaryxml ? this.sb.keyword(KEYWORDS.PRIMARY) : undefined,
        this.sb.keyword(KEYWORDS.XML),
        this.sb.keyword(KEYWORDS.INDEX),
        ...this.indexName(table, index),
        ...this.indexOn(index),
        this.indexIndexPath(index),
        this.indexWith(index),
        ...this.indexOnFilegroup(index),
        this.sb.statementDelimiterNewLine()
      )
    );
  }

  indexFulltextStatement(table, index) {
    return this.sb.statement(
      this.sb.statement(
        this.sb.keyword(KEYWORDS.CREATE),
        this.sb.keyword(KEYWORDS.FULLTEXT),
        this.sb.keyword(KEYWORDS.INDEX),
        ...this.indexName(table, index),
        ...this.indexOn(index),
        this.indexKeyIndex(index),
        this.indexWith(index),
        ...this.indexOnFilegroup(index),
        this.sb.statementDelimiterNewLine()
      )
    );
  }

  indexColumnStoredStatement(table, index) {
    return this.sb.statement(
      this.sb.statement(
        this.sb.keyword(KEYWORDS.CREATE),
        index.mssql.clustered === false
          ? this.sb.keyword(KEYWORDS.NONCLUSTERED)
          : undefined,
        this.sb.keyword(KEYWORDS.INDEX),
        ...this.indexName(table, index),
        ...this.indexOn(index),
        ...this.indexWhere(index),
        ...this.indexOrder(index),
        this.indexWith(index),
        ...this.indexOnFilegroup(index),
        this.sb.statementDelimiterNewLine()
      )
    );
  }

  refIndexColumnsBlock(obj) {
    return this.sb.list(
      ...obj.cols
        .filter(
          (fr) => !!this.getTable().cols.find((col) => fr.colid === col.id)
        )
        .map((ref) => {
          const indexCol = this.getTable().cols.find(
            (col) => ref.colid === col.id
          );
          return this.sb.block(
            this.sb.identifier(indexCol.name, false, ScopeType.SUBOBJECT),
            ...this.parameter(
              [KEYWORDS.COLLATE],
              ref.mssql?.collate,
              false,
              true
            ),
            ref.mssql?.desc ? this.sb.keyword(KEYWORDS.DESC) : undefined
          );
        })
    );
  }

  isIndexNameAutoGenerated(table, index) {
    return (
      MSSQLHelpers.makeIndexName(index, table, this.finder.tables) !==
      index.name
    );
  }

  shouldAddIndexName(table, index) {
    switch (this.generatorOptions.includeGeneratedNames) {
      case INCLUDE_GENERATED_NAMES_ALWAYS:
        return !!index.name;
      case INCLUDE_GENERATED_NAMES_CUSTOM_NAMES_ONLY:
        return this.isIndexNameAutoGenerated(table, index);
      default:
        return false;
    }
  }

  indexName(table, index) {
    return this.shouldAddIndexName(table, index)
      ? [this.sb.identifier(index.name, false, ScopeType.SUBOBJECT)]
      : [];
  }

  indexWhere(index) {
    return !_.isEmpty(index.mssql.where)
      ? [this.sb.keyword(KEYWORDS.WHERE), this.sb.code(index.mssql.where)]
      : [];
  }

  indexOrder(index) {
    return !_.isEmpty(index.mssql.order)
      ? [this.sb.keyword(KEYWORDS.ORDER), this.sb.code(index.mssql.order)]
      : [];
  }

  indexWith(index) {
    return !_.isEmpty(index.mssql.with)
      ? this.sb.statement(
          this.sb.keyword(KEYWORDS.WITH),
          this.sb.brackets(
            this.sb.code(index.mssql.with),
            true,
            BracketType.ROUND
          )
        )
      : undefined;
  }

  indexUsing(index) {
    return !_.isEmpty(index.mssql.using)
      ? [this.sb.keyword(KEYWORDS.USING), this.sb.code(index.mssql.using)]
      : [];
  }

  indexKeyIndex(index) {
    return !_.isEmpty(index.mssql.keyIndex)
      ? this.sb.statement(
          this.sb.keyword(KEYWORDS.KEY),
          this.sb.keyword(KEYWORDS.INDEX),
          this.sb.code(index.mssql.keyIndex)
        )
      : undefined;
  }
  indexIndexPath(index) {
    return !_.isEmpty(index.mssql.pathXMLIndex)
      ? this.sb.statement(
          this.sb.keyword(KEYWORDS.USING),
          this.sb.keyword(KEYWORDS.XML),
          this.sb.keyword(KEYWORDS.INDEX),
          this.sb.code(index.mssql.pathXMLIndex),
          this.sb.keyword(KEYWORDS.FOR),
          this.sb.keyword(KEYWORDS.PATH)
        )
      : undefined;
  }

  indexOn(index) {
    return [
      this.sb.keyword(KEYWORDS.ON),
      this.sb.qualifiedIdentifier(this.getTable()),
      this.sb.brackets(
        this.refIndexColumnsBlock(index),
        true,
        BracketType.ROUND
      )
    ];
  }

  indexOnFilegroup(index) {
    return !_.isEmpty(index.mssql.onFilegroup)
      ? [this.sb.keyword(KEYWORDS.ON), this.sb.code(index.mssql.onFilegroup)]
      : [];
  }

  commentStatement(type, innerObjectName, comment) {
    const schema = this.getSchema();
    if (!!schema && !_.isEmpty(comment)) {
      const tableName = this.getTable().name;
      switch (type) {
        case KEYWORDS.INDEX:
          return this.sb.statement(
            this.sb.code(`EXEC sys.sp_addextendedproperty`),
            this.sb.block(
              this.sb.code(`'MS_Description',`),
              this.sb.code(`N'${comment.replaceAll("'", "''")}',`),
              this.sb.code(`'schema', N'${schema}',`),
              this.sb.code(`'table', N'${tableName}',`),
              this.sb.code(`'index', N'${innerObjectName}';`)
            ),
            this.sb.statementDelimiterNewLine()
          );
        default:
          return undefined;
      }
    }
    return undefined;
  }

  indexCommentStatement() {
    return [
      this.commentStatement(
        KEYWORDS.INDEX,
        this.index.name,
        this.getIndex().mssql?.desc
      )
    ];
  }

  qualifiedIdentifierOnlyInner(obj, innerObj) {
    return this.sb.qualifiedIdentifierOnlyInner(obj, innerObj);
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
}
