import { ClassTable } from "../../classes/class_table";

export class ClassTablePG extends ClassTable {
  constructor(
    id,
    name,
    cols,
    keys,
    embeddable,
    defaultValues,
    objectType
  ) {
    super(id, name, cols, keys, embeddable);
    this.objectType = objectType;
    this.pg = { rowsecurity: false, schema: defaultValues.schema };
  }
}
