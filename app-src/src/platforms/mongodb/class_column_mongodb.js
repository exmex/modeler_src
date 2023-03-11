import { ClassColumn } from "../../classes/class_column";
import PropTypes from "prop-types";

export class ClassColumnMongoDb extends ClassColumn {
  constructor(id, name, datatype, isPk, isNn, list) {
    super(id, name, datatype, isPk, isNn);
    this.list = list;
    this.enum = "";
    this.validate = "";
  }
}

ClassColumn.PropTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  datatype: PropTypes.string,
  isPk: PropTypes.bool,
  isNn: PropTypes.bool,
  list: PropTypes.bool,
  validate: PropTypes.string,
  enum: PropTypes.string
};
