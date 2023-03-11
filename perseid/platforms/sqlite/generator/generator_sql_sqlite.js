import { DefaultGeneratorOptions } from "../../../generator/model-to-sql-model/generator_options";
import { FinderSQLite } from "./finder_sqlite";
import { ModelToSQLModel } from "../../../generator/model-to-sql-model/model_to_sql_model";
import { RelationToSQLModel } from "./relation_to_sql_model";
import { SQLModelBuilder } from "../../../generator/model-to-sql-model/sql_model_builder";
import { SQLModelToLines } from "../../../generator/sql-model-to-lines/model_to_lines";
import { SQLiteQuotation } from "../sqlite-quotation";
import { ScopeAnalyzerSQLite } from "./scope_analyzer_sqlite";
import { SelectTableToSQLModel } from "../../../generator/model-to-sql-model/select_table_to_sql_model";
import { TableToSQLModel } from "./table_to_sql_model";

const sqlModelBuilder = new SQLModelBuilder(new ScopeAnalyzerSQLite());
const quotation = new SQLiteQuotation();

const generateSQL = (sqlSettings, modelToSQLModel) => {
  const sqlModel = modelToSQLModel.convert();
  const toLines = new SQLModelToLines(quotation, sqlSettings, undefined);
  return toLines.generateLines(sqlModel).join("\n");
};

export const generateRelationSQL = (sqlSettings, model, relation) => {
  const modelBuilder = new RelationToSQLModel(
    sqlModelBuilder,
    new FinderSQLite(model),
    DefaultGeneratorOptions,
    relation
  );
  return generateSQL(sqlSettings, modelBuilder);
};

export const generateCreateTableSQL = (sqlSettings, model, table) => {
  const modelBuilder = new TableToSQLModel(
    sqlModelBuilder,
    new FinderSQLite(model),
    DefaultGeneratorOptions,
    table
  );
  return generateSQL(sqlSettings, modelBuilder);
};

export const generateSelectTableSQL = (sqlSettings, model, table) => {
  const modelBuilder = new SelectTableToSQLModel(
    sqlModelBuilder,
    new FinderSQLite(model),
    DefaultGeneratorOptions,
    table
  );
  return generateSQL(sqlSettings, modelBuilder);
};

export const generateSQLiteModelSQL = (
  sqlSettings,
  model,
  generatorOptions
) => {
  const modelToModelSQL = new ModelToSQLModel(
    sqlModelBuilder,
    new FinderSQLite(model),
    {
      ...generatorOptions,
      previewObject: false
    }
  );

  return generateSQL(sqlSettings, modelToModelSQL);
};
