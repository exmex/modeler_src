import PropTypes from "prop-types";
import { ClassColumn } from "../../classes/class_column";

export class ClassColumnJson extends ClassColumn {
  constructor(id, name, datatype, isPk, isNn, list) {
    super(id, name, datatype, isPk, isNn);
    this.list = list;
  }
}

ClassColumn.PropTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  datatype: PropTypes.string,
  isPk: PropTypes.bool,
  isNn: PropTypes.bool,
  list: PropTypes.bool
};
