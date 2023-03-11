import { DefaultGeneratorOptionsMSSQL } from "../../../generator/model-to-sql-model/generator_options";
import { FinderMSSQL } from "./finder_mssql";
import { IndexToSQLModelMSSQL } from "./index_to_sql_model_mssql";
import { MSSQLQuotation } from "../mssql-quotation";
import { ModelToSQLModel } from "../../../generator/model-to-sql-model/model_to_sql_model";
import { RelationToSQLModelMSSQL } from "./relation_to_sql_model_mssql";
import { SQLModelBuilder } from "../../../generator/model-to-sql-model/sql_model_builder";
import { SQLModelToLines } from "../../../generator/sql-model-to-lines/model_to_lines";
import { ScopeAnalyzerMSSQL } from "./scope_analyzer_mssql";
import { SelectTableToSQLModel } from "../../../generator/model-to-sql-model/select_table_to_sql_model";
import { SequenceToSQLModelMSSQL } from "./sequence_to_sql_model_mssql";
import { TableQualifiedNameGenerator } from "./table_qualified_name_generator";
import { TableToSQLModelMSSQL } from "./table_to_sql_model_mssql";
import { UserDefinedTypeToSQLModelMSSQL } from "./user_defined_type_to_sql_model_mssql";

const sqlModelBuilder = new SQLModelBuilder(new ScopeAnalyzerMSSQL());

const generateSQL = (sqlSettings, modelToSQLModel, defaultContainer) => {
  const sqlModel = modelToSQLModel.convert();
  const toLines = new SQLModelToLines(
    new MSSQLQuotation(sqlSettings),
    sqlSettings,
    defaultContainer
  );
  return toLines.generateLines(sqlModel).join("\n");
};

export const generateCreateSequenceSQL = (sqlSettings, model, sequence) => {
  const tableNameGenerator = createTableNameGenerator(sqlSettings, model);
  const modelBuilder = new SequenceToSQLModelMSSQL(
    sqlModelBuilder,
    new FinderMSSQL(model, tableNameGenerator),
    DefaultGeneratorOptionsMSSQL(sqlSettings),
    sequence
  );
  return generateSQL(sqlSettings, modelBuilder, model.model.mssql.schema);
};

export const generateCreateUserDefinedTypeSQL = (
  sqlSettings,
  model,
  sequence
) => {
  const tableNameGenerator = createTableNameGenerator(sqlSettings, model);
  const modelBuilder = new UserDefinedTypeToSQLModelMSSQL(
    sqlModelBuilder,
    new FinderMSSQL(model, tableNameGenerator),
    DefaultGeneratorOptionsMSSQL(sqlSettings),
    sequence
  );
  return generateSQL(sqlSettings, modelBuilder, model.model.mssql.schema);
};

export const generateRelationSQL = (sqlSettings, model, relation) => {
  const tableNameGenerator = createTableNameGenerator(sqlSettings, model);
  const modelBuilder = new RelationToSQLModelMSSQL(
    sqlModelBuilder,
    new FinderMSSQL(model, tableNameGenerator),
    DefaultGeneratorOptionsMSSQL(sqlSettings),
    relation
  );
  return generateSQL(sqlSettings, modelBuilder, model.model.mssql.schema);
};

const createTableNameGenerator = (sqlSettings, model) => {
  const toLines = new SQLModelToLines(
    new MSSQLQuotation(sqlSettings),
    sqlSettings,
    model.model.mssql.schema
  );
  return new TableQualifiedNameGenerator(sqlModelBuilder, toLines);
};

export const generateCreateTableSQL = (
  sqlSettings,
  model,
  table,
  generatorOptions
) => {
  const tableNameGenerator = createTableNameGenerator(sqlSettings, model);
  const modelBuilder = new TableToSQLModelMSSQL(
    sqlModelBuilder,
    new FinderMSSQL(model, tableNameGenerator),
    generatorOptions,
    table,
    tableNameGenerator
  );
  return generateSQL(sqlSettings, modelBuilder, model.model.mssql.schema);
};

export const generateSelectTableSQL = (sqlSettings, model, table) => {
  const tableNameGenerator = createTableNameGenerator(sqlSettings, model);
  const modelBuilder = new SelectTableToSQLModel(
    sqlModelBuilder,
    new FinderMSSQL(model, tableNameGenerator),
    DefaultGeneratorOptionsMSSQL(sqlSettings),
    table
  );
  return generateSQL(sqlSettings, modelBuilder, model.model.mssql.schema);
};

export const generateMSSQLModelSQL = (sqlSettings, model, generatorOptions) => {
  const tableNameGenerator = createTableNameGenerator(sqlSettings, model);
  const modelToModelSQL = new ModelToSQLModel(
    sqlModelBuilder,
    new FinderMSSQL(model, tableNameGenerator),
    {
      ...generatorOptions,
      previewObject: false,
      includeGeneratedNames: sqlSettings.includeGeneratedNames,
      includeSchema: sqlSettings.includeSchema
    }
  );
  return generateSQL(sqlSettings, modelToModelSQL, model.model.mssql.schema);
};

export const generateCreateIndexSQL = (
  sqlSettings,
  model,
  table,
  index,
  generatorOptions
) => {
  const tableNameGenerator = createTableNameGenerator(sqlSettings, model);
  const modelBuilder = new IndexToSQLModelMSSQL(
    sqlModelBuilder,
    new FinderMSSQL(model, tableNameGenerator),
    generatorOptions,
    table,
    index,
    tableNameGenerator
  );
  return generateSQL(sqlSettings, modelBuilder, model.model.mssql.schema);
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
    return new IndexToSQLModelMSSQL(
      sqlModelBuilder,
      finder,
      generatorOptions,
      table,
      index,
      tableNameGenerator
    );
  }
}
