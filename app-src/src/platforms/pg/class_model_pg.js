import { ClassModel } from "../../classes/class_model";
import { DefaultSqlSettingsPG } from "../../generator/sql-model-to-lines/model_to_lines";

export class ClassModelPG extends ClassModel {
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
    this.pg = { schema: "" };
    this.sqlSettings = DefaultSqlSettingsPG;
    this.nameAutoGeneration = {
      keys: true,
      indexes: true,
      relations: true
    };
  }
}
