import React from "react";
import _ from "lodash";

const MySQLFamilyHelpers = {
  getDefaultEmbeddableType() {
    return "string";
  },

  getDefaultType() {
    return "INT";
  },

  getKeyType() {
    return "INT";
  },

  getDataTypes() {
    return [
      "BIT",
      "TINYINT",
      "BOOLEAN",
      "SMALLINT",
      "MEDIUMINT",
      "INT",
      "BIGINT",
      "SERIAL",
      "DECIMAL",
      "FLOAT",
      "DOUBLE",
      "REAL",
      "DATE",
      "DATETIME",
      "TIMESTAMP",
      "TIME",
      "YEAR",
      "CHAR",
      "VARCHAR",
      "BINARY",
      "VARBINARY",
      "TINYLOB",
      "TINYTEXT",
      "BLOB",
      "TEXT",

      "MEDIUMTEXT",
      "MEDIUMBLOB",
      "LONGBLOB",
      "LONGTEXT",
      "ENUM",
      "SET",
      "GEOMETRY",
      "POINT",
      "LINESTRING",
      "POLYGON",
      "MULTIPOINT",
      "MULTILINESTRING",
      "MULTIPOLYGON",
      "GEOMETRYCOLLECTION",
      "JSON"
    ];
  },

  getJSONType() {
    return "JSON";
  },

  convertToId(currentId, customDataTypes) {
    var datatypes = this.getDataTypes();
    var toReturn;

    if (datatypes.includes(currentId)) {
      toReturn = currentId;
    } else if (customDataTypes.includes(currentId)) {
      toReturn = currentId;
    } else {
      toReturn = "INT";
    }
    return toReturn;
  },

  makeDatatypes() {
    var datatypesx = this.getDataTypes();
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
export default MySQLFamilyHelpers;
