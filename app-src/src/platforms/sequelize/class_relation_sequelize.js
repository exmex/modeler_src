import { ClassRelation } from "../../classes/class_relation";
import PropTypes from "prop-types";

export class ClassRelationSequelize extends ClassRelation {
  constructor(
    relId,
    name,
    parentTableKeyId,
    parentTableId,
    childTableId,
    cols,
    relOrmBelongs,
    relOrmHas
  ) {
    super(relId, name, parentTableKeyId, parentTableId, childTableId, cols);
    this.orm_association_belongs = relOrmBelongs || "";
    this.orm_through_belongs = "";
    this.orm_alias_belongs = "";
    this.orm_constraints_belongs = "";
    this.orm_association_has = relOrmHas || "";
    this.orm_through_has = "";
    this.orm_alias_has = "";
    this.orm_constraints_has = "";
  }
}

ClassRelationSequelize.PropTypes = {
  name: PropTypes.string
};
