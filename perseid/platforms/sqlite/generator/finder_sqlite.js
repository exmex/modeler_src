import { Finder } from "../../../generator/model-to-sql-model/finder";
import { RelationToSQLModel } from "./relation_to_sql_model";
import { TableToSQLModel } from "./table_to_sql_model";

export class FinderSQLite extends Finder {
  createToSQLModel(sb, generatorOptions, item, type) {
    if (type?.type === "relation") {
      return new RelationToSQLModel(sb, this, generatorOptions, item);
    } else if (type?.type === "table") {
      return new TableToSQLModel(sb, this, generatorOptions, item);
    }
    return super.createToSQLModel(sb, generatorOptions, item, type);
  }
}
