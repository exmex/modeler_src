import { ClassColumn } from "../../classes/class_column";
import PropTypes from "prop-types";

export class ClassColumnSQLite extends ClassColumn {
  constructor(id, name, datatype, isPk, isNn, param, collation) {
    super(id, name, datatype, isPk, isNn);
    this.param = param;
    this.collation = collation;
    this.after = "";
    this.sqlite = { autoincrement: false };
  }
}

ClassColumn.PropTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  datatype: PropTypes.string,
  isPk: PropTypes.bool,
  isNn: PropTypes.bool,
  collation: PropTypes.string,
  after: PropTypes.string
};
