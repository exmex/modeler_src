import React from "react";
import _ from "lodash";

const JsonHelpers = {
  getJsonDataTypes() {
    return ["string", "number", "object", "array", "boolean", "null"];
  },

  convertToJsonId(currentId) {
    var datatypes = JsonHelpers.getJsonDataTypes();
    var toReturn;

    if (datatypes.includes(currentId)) {
      toReturn = currentId;
    } else {
      toReturn = "string";
    }
    return toReturn;
  },

  convertToId(currentId, customDataTypes) {
    var datatypes = this.getJsonDataTypes();
    var toReturn;

    if (datatypes.includes(currentId)) {
      toReturn = currentId;
    } else if (customDataTypes.includes(currentId)) {
      toReturn = currentId;
    } else {
      toReturn = "string";
    }
    return toReturn;
  },

  makeDatatypesJson() {
    var datatypesx = this.getJsonDataTypes();
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
export default JsonHelpers;
