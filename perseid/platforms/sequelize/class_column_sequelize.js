import { ClassColumn } from "../../classes/class_column";
import PropTypes from "prop-types";

export class ClassColumnSequelize extends ClassColumn {
  constructor(id, name, datatype, isPk, isNn, param) {
    super(id, name, datatype, isPk, isNn);
    this.param = param | "";
    this.enumrange = "";
    this.unique = false;
    this.uniqueName = "";
    this.autoinc = false;
    this.collation = null;
    this.charset = null;
    this.binary = false;
    this.zerofill = false;
    this.unsigned = false;
  }
}

ClassColumn.PropTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  datatype: PropTypes.string,
  isPk: PropTypes.bool,
  isNn: PropTypes.bool,
  param: PropTypes.string,
  enumrange: PropTypes.string,
  unique: PropTypes.bool,
  uniqueName: PropTypes.string,
  autoinc: PropTypes.bool,
  collation: PropTypes.string,
  charset: PropTypes.string,
  binary: PropTypes.bool,
  zerofill: PropTypes.bool,
  unsigned: PropTypes.bool
};
