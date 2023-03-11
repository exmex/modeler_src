import { ClassModel } from "../../classes/class_model";
import { DefaultSqlSettings } from "../../generator/sql-model-to-lines/model_to_lines";

export class ClassModelLogical extends ClassModel {
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
  }
}
