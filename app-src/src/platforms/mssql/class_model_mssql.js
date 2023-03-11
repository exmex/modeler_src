import { ClassModel } from "../../classes/class_model";
import { DefaultSqlSettingsMSSQL } from "../../generator/sql-model-to-lines/model_to_lines";

export class ClassModelMSSQL extends ClassModel {
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
    this.def_coltopk = defaultValues.def_coltopk || false;
    this.mssql = { schema: "" };
    this.sqlSettings = DefaultSqlSettingsMSSQL;
    this.nameAutoGeneration = {
      keys: true,
      indexes: true,
      relations: true
    };
  }
}
