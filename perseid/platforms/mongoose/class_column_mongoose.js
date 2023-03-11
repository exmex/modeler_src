import { ClassColumn } from "../../classes/class_column";
import PropTypes from "prop-types";

/**
 * New Mongoose column spec
 *
 */
export class ClassColumnMongoose extends ClassColumn {
  constructor(id, name, datatype, isPk, isNn, list) {
    super(id, name, datatype, isPk, isNn);
    this.list = list;
    this.ref = "";
    this.options = "";
  }
}

ClassColumn.PropTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  datatype: PropTypes.string,
  isPk: PropTypes.bool,
  isNn: PropTypes.bool,
  list: PropTypes.bool,
  ref: PropTypes.string,
  options: PropTypes.any
};
