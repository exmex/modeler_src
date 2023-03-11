import _ from "lodash";

export function getDatatype(datatype, linkedOtherObject) {
  if (linkedOtherObject !== undefined) return "String";
  else if (datatype === "Mixed") return "Schema.Types.Mixed";
  else if (datatype === "ObjectId") return "Schema.Types.ObjectId";
  else if (datatype === "Decimal128") return "Schema.Types.Decimal128";
  else {
    return datatype;
  }
}

export const generateEnum = (enumOtherObject, addComma) => {
  if (enumOtherObject !== undefined) {
    return `${addComma ? ",\n" : ""}enum: [${enumOtherObject.enumValues}]`;
  } else {
    return "";
  }
};

/* tables */
export const getMongooseDefineStatement = (
  table,
  quotations,
  tables,
  indent,
  generatorOptions,
  otherObjects
) => {
  var q = quotations;
  if (table !== null) {
    var code = "\n";
    if (table.generate === true || generatorOptions.previewObject === true) {
      if (table.embeddable !== true) {
        table.beforeScript && (code += table.beforeScript + "\n");
        code += "var mongoose = require('mongoose');";
        code += "var Schema = mongoose.Schema;";
        code += "var " + table.name + " = new Schema({";
      }

      var i = 0;
      var tblCols = _.reject(table.cols, ["name", "_id"]);
      for (var col of tblCols) {
        i++;

        code += "" + col.name + ": ";
        let tbl = _.find(tables, ["id", col.datatype]);
        const linkedOtherObject = _.find(otherObjects, ["id", col.datatype]);
        if (tbl) {
          if (col.list === true) {
            code += "[{";
          } else {
            code += "{";
          }

          if (tbl.embeddable === true) {
            code +=
              getMongooseDefineStatement(
                tbl,
                quotations,
                tables,
                "   ",
                generatorOptions
              ) + "";
          } else {
            code += "type: " + tbl.name;
            if (col.nn === true) {
              code += ", required: true";
            }

            if (col.ref) {
              code += ", ref: " + q + col.ref + q;
            }
          }
          if (col.list === true) {
            code += "}]";
          } else {
            code += "}";
          }
        } else {
          if (col.list === true) {
            if (col.datatype === "Array") {
              if (col.options) {
                code += col.options;
              }
              code += generateEnum(linkedOtherObject, true);
            } else {
              code += "[{type: " + getDatatype(col.datatype, linkedOtherObject);

              if (col.nn) {
                code += ", required: true";
              }

              if (col.options) {
                code += ", " + col.options;
              }
              code += generateEnum(linkedOtherObject, true);

              if (col.ref) {
                code += ", ref: " + q + col.ref + q;
              }

              code += "}]";
            }
          } else {
            if (col.datatype === "Array") {
              code += col.param;
            } else {
              code += "{type: " + getDatatype(col.datatype, linkedOtherObject);

              if (col.nn) {
                code += ", required: true";
              }
              if (col.options) {
                code += ", " + col.options;
              }
              code += generateEnum(linkedOtherObject, true);
              if (col.ref) {
                code += ", ref: " + q + col.ref + q;
              }

              code += "}";
            }
          }
        }

        if (_.size(tblCols) !== i) code += ",";
      }

      if (table.embeddable !== true) {
        code += "}";
        table.others && (code += ", {" + table.others + "}");
        code += "); ";
      }

      if (table.embeddable !== true) {
        table.afterScript && (code += table.afterScript + "\n");
      }
    }
  }

  if (
    table.generateCustomCode === true &&
    generatorOptions.previewObject === false
  ) {
    table.customCode && (code += "\n\n" + table.customCode + "\n");
  }
  return code;
};

export const getColumnName = (tablecols, col_id) => {
  var toReturn = _.find(tablecols, ["id", col_id]);
  return toReturn.name;
};
