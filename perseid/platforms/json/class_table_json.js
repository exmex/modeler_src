import { ClassTable } from "../../classes/class_table";

export class ClassTableJson extends ClassTable {
  // eslint-disable-next-line
  constructor(id, name, cols, keys, embeddable) {
    super(id, name, cols, keys, embeddable);
  }
}
