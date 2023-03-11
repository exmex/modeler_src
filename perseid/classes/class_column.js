import PropTypes from "prop-types";

export class ClassColumn {
  constructor(id, name, datatype, isPk, isNn) {
    this.id = id;
    this.name = name;
    this.datatype = datatype;
    this.param = "";
    this.pk = isPk;
    this.nn = isNn;

    this.comment = "";
    this.defaultvalue = "";
    this.data = "";
  }
}

ClassColumn.PropTypes = {
  name: PropTypes.string,
  datatype: PropTypes.string,
  isPk: PropTypes.bool,
  isNn: PropTypes.bool
};
