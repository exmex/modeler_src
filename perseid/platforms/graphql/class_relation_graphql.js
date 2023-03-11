import { ClassRelation } from "../../classes/class_relation";

export class ClassRelationGraphQl extends ClassRelation {
  constructor(
    relId,
    name,
    parentTableKeyId,
    parentTableId,
    childTableId,
    cols,
    type,
    c_cch
  ) {
    super(relId, name, parentTableKeyId, parentTableId, childTableId, cols);
    this.type = type || "";
    this.c_cch = c_cch || "";
  }
}
