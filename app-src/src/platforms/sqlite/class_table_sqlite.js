import { ClassTable } from "../../classes/class_table";

export class ClassTableSQLite extends ClassTable {
  constructor(id, name, cols, keys, embeddable, defaultValues, objectType) {
    super(id, name, cols, keys, embeddable);
    this.collation = defaultValues.def_collation;
    this.objectType = objectType;
    this.sqlite = { withoutrowid: false, strict: false };
  }
}
