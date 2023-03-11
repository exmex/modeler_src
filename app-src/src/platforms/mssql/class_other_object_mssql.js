import { ClassOtherObject } from "../../classes/class_other_object";

export class ClassOtherObjectMSSQL extends ClassOtherObject {
  constructor(id, name, type, mssql) {
    super(id, name, type);
    this.mssql = mssql;
  }
}