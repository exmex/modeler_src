import React from "react";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";

const SequelizeHelpers = {
  getSequelizeDefaultEmbeddableType() {
    return "string";
  },

  getSequelizeDefaultType() {
    return "STRING";
  },

  getSequelizeKeyType() {
    return "UUID";
  },

  getSequelizeDataTypes() {
    return [
      "STRING",
      "TEXT",
      "TEXT('tiny')",
      "INTEGER",
      "BIGINT",
      "FLOAT",
      "REAL",
      "DOUBLE",
      "DECIMAL",
      "DATE",
      "DATEONLY",
      "BOOLEAN",
      "ENUM",
      "ARRAY",
      "JSON",
      "JSONB",
      "BLOB",
      "BLOB('tiny')",
      "UUID",
      "CIDR",
      "INET",
      "MACADOR",
      "RANGE",
      "GEOMETRY",
      "CITEXT"
    ];
  },

  makeDatatypesSequelize() {
    var datatypesx = this.getSequelizeDataTypes();
    datatypesx = datatypesx.sort();

    return _.map(datatypesx, (obj) => {
      return (
        <option key={uuidv4()} value={obj}>
          {obj}
        </option>
      );
    });
  },

  convertToId(currentId, customDataTypes) {
    var datatypes = this.getSequelizeDataTypes();
    var toReturn;

    if (datatypes.includes(currentId)) {
      toReturn = currentId;
    } else if (customDataTypes.includes(currentId)) {
      toReturn = currentId;
    } else {
      toReturn = "UUID";
    }
    return toReturn;
  }
};
export default SequelizeHelpers;
