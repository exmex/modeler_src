import { DomainToSQLModelPG } from "./domain_to_sql_model_pg";
import { EnumToSQLModelPG } from "./enum_to_sql_model_pg";
import { Finder } from "../../../generator/model-to-sql-model/finder";
import { TableToSQLModelPG } from "./table_to_sql_model_pg";
import { RelationToSQLModelPG } from "./relation_to_sql_model_pg";

export class FinderPG extends Finder {
  constructor(model, tableNameGenerator) {
    super(model);
    this.tableNameGenerator = tableNameGenerator;
  }

  objectAndTypeById(id) {
    if (this.model.otherObjects[id]) {
      if (this.model.otherObjects[id].type === "Enum") {
        return {
          obj: this.model.otherObjects[id],
          type: "other_object",
          objectType: "Enum"
        };
      } else if (this.model.otherObjects[id].type === "Domain") {
        return {
          obj: this.model.otherObjects[id],
          type: "other_object",
          objectType: "Domain"
        };
      }
    }
    if (this.model.tables[id]) {
      if (this.model.tables[id].objectType === "composite") {
        return {
          obj: this.model.tables[id],
          type: "table",
          objectType: "Composite"
        };
      }
    }
    return super.objectAndTypeById(id);
  }

  createToSQLModel(sb, generatorOptions, item, type) {
    if (type?.objectType === "Table" || type?.objectType === "Composite") {
      return new TableToSQLModelPG(
        sb,
        this,
        generatorOptions,
        item,
        this.tableNameGenerator
      );
    }
    if (type?.objectType === "Domain") {
      return new DomainToSQLModelPG(sb, this, generatorOptions, item);
    }
    if (type?.objectType === "Enum") {
      return new EnumToSQLModelPG(sb, this, generatorOptions, item);
    }
    if (type?.type === "relation") {
      return new RelationToSQLModelPG(sb, this, generatorOptions, item);
    }
    return super.createToSQLModel(sb, generatorOptions, item, type);
  }
}
