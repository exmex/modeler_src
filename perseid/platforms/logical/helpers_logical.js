import React from "react";
import _ from "lodash";

const LogicalHelpers = {
  getLogicalDataTypes() {
    return [
      "",
      "STRING",
      "NUMBER",
      "JSON",
      "XML",
      "BOOLEAN",
      "ENUM",
      "TEXT",
      "BLOB",
      "CHARACTER",
      "CHARACTER VARYING",
      "BIT",
      "BIT VARYING",
      "NUMERIC",
      "DECIMAL",
      "INTEGER",
      "SMALLINT",
      "FLOAT",
      "REAL",
      "DOUBLE",
      "DATE",
      "TIME",
      "TIMESTAMP",
      "INTERVAL"
    ];
  },

  convertToId(currentId, customDataTypes) {
    var datatypes = this.getLogicalDataTypes();
    var toReturn;

    if (datatypes.includes(currentId)) {
      toReturn = currentId;
    } else if (customDataTypes.includes(currentId)) {
      toReturn = currentId;
    } else {
      toReturn = "";
    }
    return toReturn;
  },

  getLogicalDefaultEmbeddableType() {
    return `string`;
  },

  getLogicalDefaultType() {
    return ``;
  },

  getJSONType() {
    return `string`;
  },

  getLogicalKeyType() {
    return "";
  },

  makeDatatypes() {
    var datatypesx = this.getLogicalDataTypes();
    datatypesx = datatypesx.sort();

    return _.map(datatypesx, (obj) => {
      return (
        <option key={obj} value={obj}>
          {obj}
        </option>
      );
    });
  }
};
export default LogicalHelpers;
