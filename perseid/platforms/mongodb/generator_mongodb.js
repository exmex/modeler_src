import Helpers from "../../helpers/helpers";
import MongoDbHelpers from "./helpers_mongodb";
import _ from "lodash";

export function getRequired(cols) {
  cols = _.reject(cols, ["name", "_id"]);
  var required = _.filter(cols, ["nn", true]);
  var cnt = _.size(required);
  var toReturn = "";
  var i = 1;
  if (cnt > 0) {
    for (var r of required) {
      toReturn += "         '" + r.name + "'";
      i < cnt && (toReturn += ", ");
      i++;
    }
  }
  return toReturn;
}

/* indexes */
export const getMongoDbCreateIndexesStatement = (table) => {
  var code = "";
  if (table !== null) {
    if (_.size(table.indexes) === 0) {
      return "";
    }
    code += "\n ";

    for (var collectionIndex of table.indexes) {
      code += getMongoDbCreateIndexStatement(collectionIndex, table.name);
    }
  }
  return code;
};

export const getMongoDbCreateIndexStatement = (index, tableName) => {
  let toReturn = `db.${tableName}.createIndex(\n${
    index.mongodb.fields !== undefined ? index.mongodb.fields : ""
  }`;
  if (
    index.mongodb.options !== null &&
    index.mongodb.options !== undefined &&
    index.mongodb.options !== ""
  ) {
    toReturn += `,\n ${index.mongodb.options}\n`;
  }
  toReturn += `)\n\n`;
  return toReturn;
};

/* collections */
export const getMongoDbDefineStatement = (
  table,
  quotations,
  tables,
  indent,
  generatorOptions
) => {
  var q = quotations;
  if (table !== null) {
    var code = "\n";

    if (table.generate === true || generatorOptions.previewObject === true) {
      if (table.embeddable !== true) {
        table.beforeScript && (code += table.beforeScript + "\n");

        code += "db.createCollection( " + q;

        code += table.name + q + ", {";

        code += "validator: {";

        code += "$jsonSchema: {";

        code += "bsonType: " + q + "object" + q + ",";

        if (table.desc) {
          code += "description:" + q + Helpers.replaceSingleApostroph(table.desc) + q + ",";
        }
      }

      code += "title:" + q + table.name + q + ",";

      const required = getRequired(table.cols);
      if (required !== "") {
        code += "required: [" + getRequired(table.cols) + "],";
      }

      let props = [];

      const properties = getProperties(table, false);
      let prop = generateProperties(
        properties,
        tables,
        quotations,
        q,
        false,
        generatorOptions
      );
      if (prop) {
        props.push(prop);
      }
      const patternProperties = getProperties(table, true);
      prop = generateProperties(
        patternProperties,
        tables,
        quotations,
        q,
        true,
        generatorOptions
      );
      if (prop) {
        props.push(prop);
      }
      prop = generateValidator(table);
      if (prop) {
        props.push(prop);
      }
      code += props.join(`,\n`);
      if (table.embeddable !== true) {
        var otherOptions = [];
        otherOptions = [
          ...otherOptions,
          Helpers.getCodeSwitch(table.capped, "capped", "")
        ];
        otherOptions = [
          ...otherOptions,
          Helpers.getCodeSwitch(table.autoIndexId, "autoIndexId", "")
        ];

        otherOptions = [
          ...otherOptions,
          Helpers.getCode(table.size, "size", "")
        ];

        otherOptions = [...otherOptions, Helpers.getCode(table.max, "max", "")];

        otherOptions = [
          ...otherOptions,
          Helpers.getCodeSelect(table.validationLevel, "validationLevel", "'")
        ];

        otherOptions = [
          ...otherOptions,
          Helpers.getCodeSelect(table.validationAction, "validationAction", "'")
        ];

        otherOptions = [
          ...otherOptions,
          Helpers.getCode(table.storageEngine, "storageEngine", "")
        ];

        otherOptions = [
          ...otherOptions,
          Helpers.getCode(table.indexOptionDefaults, "indexOptionDefaults", "")
        ];

        otherOptions = [
          ...otherOptions,
          Helpers.getCode(table.viewOn, "viewOn", "")
        ];

        otherOptions = [
          ...otherOptions,
          Helpers.getCode(table.pipeline, "pipeline", "")
        ];

        otherOptions = [
          ...otherOptions,
          Helpers.getCode(table.collation, "collation", "")
        ];

        otherOptions = [
          ...otherOptions,
          Helpers.getCode(table.writeConcern, "writeConcern", "")
        ];

        otherOptions = [
          ...otherOptions,
          Helpers.getCode(table.others, "others", "")
        ];

        code += "         }";
        code += "      }";
        code += Helpers.getArrayValues(otherOptions, true, ",", "");
        code += "});  ";
      }

      if (table.embeddable !== true) {
        table.afterScript && (code += table.afterScript + "\n");
      }
    }

    code += getMongoDbCreateIndexesStatement(table);
  }

  if (
    table.generateCustomCode === true &&
    generatorOptions.previewObject === false
  ) {
    table.customCode && (code += "\n\n" + table.customCode + "\n");
  }

  return code;
};

const getProperties = (table, pattern) => {
  var tblCols = additinalProperites(table)
    ? _.reject(table.cols, ["name", "_id"])
    : table.cols;
  tblCols = _.reject(tblCols, ["pattern", !pattern]);
  if (pattern === true) {
    tblCols = _.filter(tblCols, (i) => i.pattern);
  }
  return tblCols;
};

const generateValidator = (table) => {
  return table.validation ? table.validation : undefined;
};

const additinalProperites = (table) => {
  if (!table.validation) {
    return true;
  }
  try {
    const regex = /(^|,)[\W]*(additionalProperties[\W]*:[\W]*false)[\W]*($|,)/m;
    return !table.validation.match(regex);
  } catch (e) {
    return true;
  }
};

const generateProperties = (
  tblCols,
  tables,
  quotations,
  q,
  pattern,
  generatorOptions
) => {
  if (tblCols.length === 0) {
    return undefined;
  }
  var i = 0;
  var code = pattern === true ? "patternProperties: {" : "properties: {";
  for (var col of tblCols) {
    i++;

    code += `${col.pattern === true ? `"${col.name}"` : col.name}: {`;
    let tbl = _.find(tables, ["id", col.datatype]);
    if (tbl) {
      if (col.list === true) {
        code += "bsonType: " + q + "array" + q + ",";
      } else {
        code += "bsonType: " + q + "object" + q + ",";
      }
      if (col.validation) {
        code += col.validation + ",";
      }
      if (col.comment) {
        code += "description:" + q + Helpers.replaceSingleApostroph(col.comment) + q + ",";
      }
      if (col.list === true) {
        code += "items: {";
      }
      code +=
        getMongoDbDefineStatement(
          tbl,
          quotations,
          tables,
          "   ",
          generatorOptions
        ) + "";

      if (col.list === true) {
        code += "}";
      }
      code += "}";
    } else {
      if (col.datatype === "enum") {
        code += "enum: " + col.enum;
        if (col.validation) {
          code += ", " + col.validation;
        }
      } else {
        if (col.list === true) {
          code += "bsonType: " + q + "array" + q + ",";

          if (col.comment) {
            code += "description:" + q + Helpers.replaceSingleApostroph(col.comment) + q + ",";
          }

          code += "items: {";
          if (col.datatype !== "array") {
            code += generateBsonType(q, col);
            if (col.validation) {
              code += ", " + col.validation;
            }
          } else {
            if (col.validation) {
              code += col.validation;
            }
          }

          code += "}";
        } else {
          code += generateBsonType(q, col);
          if (col.validation) {
            code += ", " + col.validation;
          }
          if (col.comment) {
            code += ", description:" + q + Helpers.replaceSingleApostroph(col.comment) + q;
          }
        }
      }
      code += "}";
    }

    if (_.size(tblCols) !== i) code += ",";
  }
  code += "}";
  return code;
};

function generateBsonType(q, col) {
  if (col.datatype === "any") {
    if (col.any === "" || col.any === undefined) {
      const anyTypes = MongoDbHelpers.getMongoDBDataTypes().filter(
        (type) => type !== "any"
      );
      return `bsonType: [${anyTypes
        .map((type) => `${q}${type}${q}`)
        .join(", ")}]`;
    } else {
      return `bsonType: [${col.any}]`;
    }
  } else {
    return "bsonType: " + q + col.datatype + q;
  }
}

export const getColumnName = (tablecols, col_id) => {
  var toReturn = _.find(tablecols, ["id", col_id]);
  return toReturn.name;
};
