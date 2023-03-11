import React from "react";
import _ from "lodash";

const GraphQlHelpers = {
  getGraphQlDefaultType() {
    return "String";
  },

  getGraphQlDataTypes() {
    var d = ["String", "Int", "Float", "Boolean", "ID", "Date"];
    return d;
  },

  convertToId(currentId, customDataTypes) {
    var datatypes = this.getGraphQlDataTypes();
    var toReturn;

    if (datatypes.includes(currentId)) {
      toReturn = currentId;
    } else if (customDataTypes.includes(currentId)) {
      toReturn = currentId;
    } else {
      toReturn = "String";
    }
    return toReturn;
  },

  makeDatatypesGraphQl() {
    var datatypes = this.getGraphQlDataTypes();
    //datatypes = datatypes.sort();

    return _.map(datatypes, obj => {
      return (
        <option key={obj} value={obj}>
          {obj}
        </option>
      );
    });
  },

  makeDatatypesGraphQlDetailed() {
    var datatypes = [
      ["String", "string"],
      ["Int", "int"],
      ["Float", "float"],
      ["Array", "array"],
      ["Boolean", "boolean"],
      ["ID", "id"],
      ["Date", "date"]
    ].sort();

    return _.map(datatypes, obj => {
      return (
        <option key={obj[0]} value={obj[1]}>
          {obj[0]}
        </option>
      );
    });
  }
};
export default GraphQlHelpers;
