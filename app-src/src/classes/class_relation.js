import PropTypes from "prop-types";

export class ClassRelation {
  constructor(
    relId,
    name,
    parentTableKeyId,
    parentTableId,
    childTableId,
    cols
  ) {
    this.id = relId;
    this.visible = true;
    this.name = name;
    this.desc = "";
    this.type = "identifying";
    this.parent_key = parentTableKeyId;
    this.parent = parentTableId;
    this.child = childTableId;
    this.c_mp = "true";
    this.c_mch = "true";
    this.c_p = "one";
    this.c_ch = "many";
    this.c_cp = "";
    this.c_cch = "";
    this.cols = cols;
    this.generate = true;
    this.generateCustomCode = true;
  }
}

ClassRelation.PropTypes = {
  visible: PropTypes.bool,
  name: PropTypes.string,
  parentTableKeyId: PropTypes.number
};
