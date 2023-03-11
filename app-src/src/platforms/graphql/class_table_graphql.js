import { ClassTable } from "../../classes/class_table";

export class ClassTableGraphQl extends ClassTable {
  constructor(
    id,
    name,
    cols,
    keys,
    embeddable,
    defaultValues,
    objectType,
    directive
  ) {
    super(id, name, cols, keys, embeddable);
    this.objectType = objectType;
    this.others = defaultValues.def_others;
    this.directive = directive;
  }
}
