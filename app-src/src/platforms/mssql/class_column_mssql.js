import { ClassColumn } from "../../classes/class_column";
import PropTypes from "prop-types";

export class ClassColumnMSSQL extends ClassColumn {
  constructor(id, name, datatype, isPk, isNn, param, list) {
    super(id, name, datatype, isPk, isNn);
    this.param = param;
    this.collation = null;
    this.list = list;
    this.after = "";
    this.mssql = { computed: "" };
  }
}

ClassColumn.PropTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  datatype: PropTypes.string,
  isPk: PropTypes.bool,
  isNn: PropTypes.bool,
  param: PropTypes.string,
  collation: PropTypes.string,
  list: PropTypes.bool,
  after: PropTypes.string
};
