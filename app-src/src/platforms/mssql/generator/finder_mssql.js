import { CodeToSQLModelMSSQL } from "./code_to_sql_model_msssql";
import { Finder } from "../../../generator/model-to-sql-model/finder";
import { RelationToSQLModelMSSQL } from "./relation_to_sql_model_mssql";
import { SequenceToSQLModelMSSQL } from "./sequence_to_sql_model_mssql";
import { TableToSQLModelMSSQL } from "./table_to_sql_model_mssql";
import { UserDefinedTypeToSQLModelMSSQL } from "./user_defined_type_to_sql_model_mssql";

export class FinderMSSQL extends Finder {
  constructor(model, tableNameGenerator) {
    super(model);
    this.tableNameGenerator = tableNameGenerator;
  }

  objectAndTypeById(id) {
    if (this.model.otherObjects[id]) {
      if (this.model.otherObjects[id].type === "Sequence") {
        return {
          obj: this.model.otherObjects[id],
          type: "other_object",
          objectType: "Sequence"
        };
      } else if (this.model.otherObjects[id].type === "UserDefinedType") {
        return {
          obj: this.model.otherObjects[id],
          type: "other_object",
          objectType: "UserDefinedType"
        };
      }
    }
    return super.objectAndTypeById(id);
  }

  createToSQLModel(sb, generatorOptions, item, type) {
    if (type?.objectType === "Table") {
      return new TableToSQLModelMSSQL(
        sb,
        this,
        generatorOptions,
        item,
        this.tableNameGenerator
      );
    }
    if (type?.type === "relation") {
      return new RelationToSQLModelMSSQL(sb, this, generatorOptions, item);
    }
    if (type?.objectType === "Sequence") {
      return new SequenceToSQLModelMSSQL(sb, this, generatorOptions, item);
    }

    if (type?.objectType === "UserDefinedType") {
      return new UserDefinedTypeToSQLModelMSSQL(
        sb,
        this,
        generatorOptions,
        item
      );
    }

    if (type?.type === "other_object" || type?.type === "line") {
      return new CodeToSQLModelMSSQL(sb, this, generatorOptions, item);
    }

    return super.createToSQLModel(sb, generatorOptions, item, type);
  }
}
