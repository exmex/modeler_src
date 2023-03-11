import { DefaultGeneratorOptionsPG } from "../../../generator/model-to-sql-model/generator_options";
import { DomainToSQLModelPG } from "./domain_to_sql_model_pg";
import { EnumToSQLModelPG } from "./enum_to_sql_model_pg";
import { FinderPG } from "./finder_pg";
import { IndexToSQLModelPG } from "./index_to_sql_model_pg";
import { ModelToSQLModel } from "../../../generator/model-to-sql-model/model_to_sql_model";
import { PgQuotation } from "../pg-quotation";
import { RelationToSQLModelPG } from "./relation_to_sql_model_pg";
import { SQLModelBuilder } from "../../../generator/model-to-sql-model/sql_model_builder";
import { SQLModelToLines } from "../../../generator/sql-model-to-lines/model_to_lines";
import { ScopeAnalyzerPG } from "./scope_analyzer_pg";
import { SelectTableToSQLModel } from "../../../generator/model-to-sql-model/select_table_to_sql_model";
import { TableQualifiedNameGenerator } from "./table_qualified_name_generator";
import { TableToSQLModelPG } from "./table_to_sql_model_pg";

const sqlModelBuilder = new SQLModelBuilder(new ScopeAnalyzerPG());
const quotation = new PgQuotation();

const generateSQL = (sqlSettings, modelToSQLModel, defaultContainer) => {
  const sqlModel = modelToSQLModel.convert();
  const toLines = new SQLModelToLines(quotation, sqlSettings, defaultContainer);
  return toLines.generateLines(sqlModel).join("\n");
};

export const generateRelationSQL = (sqlSettings, model, relation) => {
  const tableNameGenerator = createTableNameGenerator(sqlSettings, model);
  const modelBuilder = new RelationToSQLModelPG(
    sqlModelBuilder,
    new FinderPG(model, tableNameGenerator),
    DefaultGeneratorOptionsPG(sqlSettings),
    relation
  );
  return generateSQL(sqlSettings, modelBuilder, model.model.pg.schema);
};

const createTableNameGenerator = (sqlSettings, model) => {
  const toLines = new SQLModelToLines(
    quotation,
    sqlSettings,
    model.model.pg.schema
  );
  return new TableQualifiedNameGenerator(sqlModelBuilder, toLines);
};

export const generateCreateTableSQL = (sqlSettings, model, table, options) => {
  const tableNameGenerator = createTableNameGenerator(sqlSettings, model);
  const modelBuilder = new TableToSQLModelPG(
    sqlModelBuilder,
    new FinderPG(model, tableNameGenerator),
    options,
    table,
    tableNameGenerator
  );
  return generateSQL(sqlSettings, modelBuilder, model.model.pg.schema);
};

export const generateCreateIndexSQL = (
  sqlSettings,
  model,
  table,
  index,
  options
) => {
  const tableNameGenerator = createTableNameGenerator(sqlSettings, model);
  const modelBuilder = new IndexToSQLModelPG(
    sqlModelBuilder,
    new FinderPG(model, tableNameGenerator),
    options,
    table,
    index,
    tableNameGenerator
  );
  return generateSQL(sqlSettings, modelBuilder, model.model.pg.schema);
};

export const generateCreateEnumSQL = (sqlSettings, model, enu) => {
  const tableNameGenerator = createTableNameGenerator(sqlSettings, model);
  const modelBuilder = new EnumToSQLModelPG(
    sqlModelBuilder,
    new FinderPG(model, tableNameGenerator),
    DefaultGeneratorOptionsPG(sqlSettings),
    enu
  );
  return generateSQL(sqlSettings, modelBuilder, model.model.pg.schema);
};

export const generateSelectTableSQL = (sqlSettings, model, table) => {
  const tableNameGenerator = createTableNameGenerator(sqlSettings, model);
  const modelBuilder = new SelectTableToSQLModel(
    sqlModelBuilder,
    new FinderPG(model, tableNameGenerator),
    DefaultGeneratorOptionsPG(sqlSettings),
    table
  );
  return generateSQL(sqlSettings, modelBuilder, model.model.pg.schema);
};

export const generateCreateDomainSQL = (sqlSettings, model, domain) => {
  const tableNameGenerator = createTableNameGenerator(sqlSettings, model);
  const modelBuilder = new DomainToSQLModelPG(
    sqlModelBuilder,
    new FinderPG(model, tableNameGenerator),
    DefaultGeneratorOptionsPG(sqlSettings),
    domain
  );
  return generateSQL(sqlSettings, modelBuilder, model.model.pg.schema);
};

export const generatePgModelSQL = (sqlSettings, model, generatorOptions) => {
  const tableNameGenerator = createTableNameGenerator(sqlSettings, model);
  const modelToModelSQL = new ModelToSQLModel(
    sqlModelBuilder,
    new FinderPG(model, tableNameGenerator),
    {
      ...generatorOptions,
      previewObject: false,
      includeGeneratedNames: sqlSettings.includeGeneratedNames
    }
  );
  return generateSQL(sqlSettings, modelToModelSQL, model.model.pg.schema);
};

export class ModelBuilderFactory {
  static createIndexToSQLModel(
    sqlModelBuilder,
    finder,
    generatorOptions,
    table,
    index,
    tableNameGenerator
  ) {
    return new IndexToSQLModelPG(
      sqlModelBuilder,
      finder,
      generatorOptions,
      table,
      index,
      tableNameGenerator
    );
  }
}
