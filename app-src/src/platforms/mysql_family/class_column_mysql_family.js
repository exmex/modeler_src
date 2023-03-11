import { ClassColumn } from "../../classes/class_column";
import PropTypes from "prop-types";

export class ClassColumnMySQLFamily extends ClassColumn {
  constructor(id, name, datatype, isPk, isNn, param, list) {
    super(id, name, datatype, isPk, isNn);
    this.param = param;
    this.autoinc = false;
    this.collation = null;
    this.charset = null;
    this.binary = false;
    this.zerofill = false;
    this.unsigned = false;
    this.enum = "";
    this.list = list;
    this.after = "";
  }
}

ClassColumn.PropTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  datatype: PropTypes.string,
  isPk: PropTypes.bool,
  isNn: PropTypes.bool,
  param: PropTypes.string,
  autoinc: PropTypes.bool,
  collation: PropTypes.string,
  charset: PropTypes.string,
  binary: PropTypes.bool,
  zerofill: PropTypes.bool,
  unsigned: PropTypes.bool,
  enum: PropTypes.string,
  list: PropTypes.bool,
  after: PropTypes.string
};
