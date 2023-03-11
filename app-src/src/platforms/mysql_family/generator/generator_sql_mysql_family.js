import { DefaultGeneratorOptionsMySQLFamily } from "../../../generator/model-to-sql-model/generator_options";
import { FinderMySQLFamily } from "./finder_mysql_family";
import { IndexToSQLModel } from "./index_to_sql_model";
import { ModelToSQLModel } from "../../../generator/model-to-sql-model/model_to_sql_model";
import { MySQLFamilyQuotation } from "../mysql-family-quotation";
import { RelationToSQLModel } from "../../../generator/model-to-sql-model/relation_to_sql_model";
import { SQLModelBuilder } from "../../../generator/model-to-sql-model/sql_model_builder";
import { SQLModelToLines } from "../../../generator/sql-model-to-lines/model_to_lines";
import { ScopeAnalyzerMySQLFamily } from "./scope_analyzer_mysql_family";
import { SelectTableToSQLModel } from "../../../generator/model-to-sql-model/select_table_to_sql_model";
import { TableToSQLModel } from "./table_to_sql_model";

const sqlModelBuilder = new SQLModelBuilder(new ScopeAnalyzerMySQLFamily());
const quotation = new MySQLFamilyQuotation();

const generateSQL = (sqlSettings, modelToSQLModel, defaultContainer) => {
  const sqlModel = modelToSQLModel.convert();
  const toLines = new SQLModelToLines(quotation, sqlSettings, defaultContainer);
  return toLines.generateLines(sqlModel).join("\n");
};

export const generateRelationSQL = (sqlSettings, model, relation) => {
  const modelBuilder = new RelationToSQLModel(
    sqlModelBuilder,
    new FinderMySQLFamily(model),
    DefaultGeneratorOptionsMySQLFamily,
    relation
  );
  return generateSQL(sqlSettings, modelBuilder, model.model.schema);
};

export const generateCreateTableSQL = (sqlSettings, model, table, options) => {
  const modelBuilder = new TableToSQLModel(
    sqlModelBuilder,
    new FinderMySQLFamily(model),
    options,
    table
  );
  return generateSQL(sqlSettings, modelBuilder, model.model.schema);
};

export const generateCreateIndexSQL = (
  sqlSettings,
  model,
  table,
  index,
  options
) => {
  const modelBuilder = new IndexToSQLModel(
    sqlModelBuilder,
    new FinderMySQLFamily(model),
    options,
    table,
    index
  );
  return generateSQL(sqlSettings, modelBuilder, model.model.schema);
};

export const generateSelectTableSQL = (sqlSettings, model, table) => {
  const modelBuilder = new SelectTableToSQLModel(
    sqlModelBuilder,
    new FinderMySQLFamily(model),
    DefaultGeneratorOptionsMySQLFamily,
    table
  );
  return generateSQL(sqlSettings, modelBuilder, model.model.schema);
};

export const generateMySQLFamilyModelSQL = (
  sqlSettings,
  model,
  generatorOptions
) => {
  const modelToModelSQL = new ModelToSQLModel(
    sqlModelBuilder,
    new FinderMySQLFamily(model),
    {
      ...generatorOptions,
      previewObject: false
    }
  );
  return generateSQL(sqlSettings, modelToModelSQL, model.model.schema);
};

export class ModelBuilderFactory {
  static createIndexToSQLModel(
    sqlModelBuilder,
    finder,
    generatorOptions,
    table,
    index
  ) {
    return new IndexToSQLModel(
      sqlModelBuilder,
      finder,
      generatorOptions,
      table,
      index
    );
  }
}
