import { ClassTable } from "../../classes/class_table";

export class ClassTableMongoDb extends ClassTable {
  constructor(id, name, cols, keys, embeddable, defaultValues) {
    super(id, name, cols, keys, embeddable);
    this.validationLevel = defaultValues.def_validationLevel;
    this.validationAction = defaultValues.def_validationAction;
    this.collation = defaultValues.def_collation;
    this.others = defaultValues.def_others;
  }
}
