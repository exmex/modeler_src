import { ClassTable } from "../../classes/class_table";

export class ClassTableMongoose extends ClassTable {
  constructor(id, name, cols, keys, embeddable, defaultValues) {
    super(id, name, cols, keys, embeddable, defaultValues);
    this.others = defaultValues.def_others;
  }
}
