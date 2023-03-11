import { Finder } from "../../../generator/model-to-sql-model/finder";
import { TableToSQLModel } from "./table_to_sql_model";

export class FinderMySQLFamily extends Finder {
  createToSQLModel(sb, generatorOptions, item, type) {
    if (type?.type === "table") {
      return new TableToSQLModel(sb, this, generatorOptions, item);
    }
    return super.createToSQLModel(sb, generatorOptions, item, type);
  }
}
