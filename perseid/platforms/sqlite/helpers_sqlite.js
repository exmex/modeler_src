import React from "react";
import _ from "lodash";

const SQLiteHelpers = {
  getSQLiteDataTypes() {
    return ["INTEGER", "REAL", "TEXT", "BLOB"];
  },

  convertToId(currentId, customDataTypes) {
    var datatypes = this.getSQLiteDataTypes();
    var toReturn;

    if (datatypes.includes(currentId)) {
      toReturn = currentId;
    } else if (customDataTypes.includes(currentId)) {
      toReturn = currentId;
    } else {
      toReturn = "INTEGER";
    }
    return toReturn;
  },

  getSQLiteDefaultEmbeddableType() {
    return `string`;
  },

  getSQLiteDefaultType() {
    return `INTEGER`;
  },

  getJSONType() {
    return `TEXT`;
  },

  getSQLiteKeyType() {
    return "INTEGER";
  },

  makeDatatypes() {
    var datatypesx = this.getSQLiteDataTypes();
    datatypesx = datatypesx.sort();

    return _.map(datatypesx, obj => {
      return (
        <option key={obj} value={obj}>
          {obj}
        </option>
      );
    });
  }
};
export default SQLiteHelpers;
