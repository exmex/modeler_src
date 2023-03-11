import { ClassModel } from "../../classes/class_model";
import { DefaultMySqlFamilySqlSettings } from "../../generator/sql-model-to-lines/model_to_lines";

export class ClassModelMySQLFamily extends ClassModel {
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
    this.def_tabletype = defaultValues.def_tabletype || "na";
    this.def_collation = defaultValues.def_collation || "";
    this.def_charset = defaultValues.def_charset || "";
    this.def_coltopk = defaultValues.def_coltopk || false;
    this.def_rowformat = defaultValues.def_rowformat || "na";
    this.sqlSettings = DefaultMySqlFamilySqlSettings;
  }
}
