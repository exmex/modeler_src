import { ClassModel } from "../../classes/class_model";

export class ClassModelMongoose extends ClassModel {
  constructor(id, diagramId, name, desc, type, version, storedIn, defaultValues) {
    super(id, diagramId, name, desc, type, version, storedIn);
    this.def_coltopk = defaultValues.def_coltopk || false;
    this.def_others = defaultValues.def_others || "";
  }
}
