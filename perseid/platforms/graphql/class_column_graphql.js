import { ClassColumn } from "../../classes/class_column";
import PropTypes from "prop-types";

export class ClassColumnGraphQl extends ClassColumn {
  constructor(
    id,
    name,
    datatype,
    isPk,
    isNn,
    list,
    fieldArguments,
    isHidden,
    isArrayItemNn,
    fieldDirective
  ) {
    super(id, name, datatype, isPk, isNn);
    this.list = list;
    this.fieldArguments = fieldArguments;
    this.isHidden = isHidden;
    this.isArrayItemNn = isArrayItemNn;
    this.fieldDirective = fieldDirective;
  }
}

ClassColumn.PropTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  datatype: PropTypes.string,
  isPk: PropTypes.bool,
  isNn: PropTypes.bool,
  list: PropTypes.bool,
  fieldArguments: PropTypes.string,
  isHidden: PropTypes.bool,
  isArrayItemNn: PropTypes.bool,
  fieldDirective: PropTypes.string
};
