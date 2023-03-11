import { ClassModel } from "../../classes/class_model";
import { DefaultSqlSettings } from "../../generator/sql-model-to-lines/model_to_lines";

export class ClassModelSQLite extends ClassModel {
  constructor(
    id,
    diagramId,
    name,
    desc,
    type,
    version,
    storedIn,
    defaultValues
  ) {
    super(id, diagramId, name, desc, type, version, storedIn);
    this.def_collation = defaultValues.def_collation || "";
    this.def_coltopk = defaultValues.def_coltopk || false;
    this.sqlSettings = DefaultSqlSettings;
  }
}
