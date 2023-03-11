import { ClassTable } from "../../classes/class_table";

export class ClassTableMSSQL extends ClassTable {
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
    this.mssql = { schema: defaultValues.schema };
  }
}
