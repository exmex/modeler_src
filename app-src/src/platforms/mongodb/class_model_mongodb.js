import { ClassModel } from "../../classes/class_model";

export class ClassModelMongoDb extends ClassModel {
  constructor(id, diagramId, name, desc, type, version, storedIn, defaultValues) {
    super(id, diagramId, name, desc, type, version, storedIn);
    this.def_coltopk = defaultValues.def_coltopk || false;
    this.def_validationLevel = defaultValues.def_validationLevel || "na";
    this.def_validationAction = defaultValues.def_validationAction || "na";
    this.def_collation = defaultValues.def_collation || "";
    this.def_others = defaultValues.def_others || "";
  }
}
