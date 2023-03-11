import { ClassColumn } from "../../classes/class_column";
import PropTypes from "prop-types";

export class ClassColumnLogical extends ClassColumn {
  constructor(id, name, datatype, isPk, isNn, param) {
    super(id, name, datatype, isPk, isNn);
    this.param = param;
  }
}

ClassColumn.PropTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  datatype: PropTypes.string,
  isPk: PropTypes.bool,
  isNn: PropTypes.bool
};
