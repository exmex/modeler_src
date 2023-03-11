import { ClassOtherObject } from "../../classes/class_other_object";

export class ClassOtherObjectPG extends ClassOtherObject {
  constructor(id, name, type, pg) {
    super(id, name, type);
    this.pg = pg;
  }
}