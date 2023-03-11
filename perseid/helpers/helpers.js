import JsonSchemaHelpers from "../platforms/jsonschema/helpers_jsonschema";
import _ from "lodash";
import js_beautify from "js-beautify";
import json5 from "json5";
import moment from "moment";
import yaml from "yaml";

const Helpers = {
  garr: function (prop) {
    if (prop !== null && prop !== undefined) {
      if (Array.isArray(prop)) return prop;
      else return [];
    } else return [];
  },

  gv: function (prop) {
    if (prop !== null && prop !== undefined) {
      return prop;
    } else return "";
  },

  gch: function (prop) {
    if (prop !== null && prop !== undefined) {
      return prop;
    } else return false;
  },

  gsel: function (prop) {
    if (prop !== null && prop !== undefined) {
      return prop;
    } else return "na";
  },

  getSchemaContainer(name) {
    if (name !== undefined && name !== null && name !== "") {
      return name + ".";
    } else return "";
  },

  shortenString(string, useDots, maxCharsLength) {
    let dots = "";
    if (useDots && maxCharsLength < string.length) {
      dots = "...";
    }

    return dots + "" + string.substr(string.length - maxCharsLength);
  },

  containsBrackets(value) {
    if (_.includes(value, "{") || _.includes(value, "[")) {
      return true;
    } else {
      return false;
    }
  },

  isNull(value) {
    if (typeof value === "string") {
      value = value.trim().toLowerCase();
    }
    switch (value) {
      case null:
      case "null":
        return true;
      default:
        return false;
    }
  },

  isTrue(value) {
    if (typeof value === "string") {
      value = value.trim().toLowerCase();
    }
    switch (value) {
      case true:
      case "true":
        return true;
      default:
        return false;
    }
  },

  isFalse(value) {
    if (typeof value === "string") {
      value = value.trim().toLowerCase();
    }
    switch (value) {
      case false:
      case "false":
        return true;
      default:
        return false;
    }
  },

  isNumber(value) {
    return Number.isNaN(+value) === false ? true : false;
  },

  isValidJson5Structure(value) {
    try {
      json5.parse(value);
      return true;
    } catch (e) {
      return false;
    }
  },

  getDefinedJson(value) {
    let valueType = typeof value;
    switch (valueType) {
      case "object":
        if (value === null) return "";
        try {
          return js_beautify(JSON.stringify(value), {
            indent_size: 2,
            preserve_newlines: true,
            keep_array_indentation: true
          });
        } catch (e) {
          console.log(e.message);
        }
      default:
        return value;
    }
  },

  parseJson(stringValue) {
    try {
      return JSON.parse(stringValue);
    } catch (e) {
      return json5.parse(stringValue);
    }
  },

  stringifyJson(obj, strictJsonFormat) {
    if (strictJsonFormat === true) {
      return JSON.stringify(obj, null, "  ");
    } else {
      return json5.stringify(obj, { quote: "", space: "  " });
    }
  },

  stringifyYAML(obj) {
    return yaml.stringify(obj);
  },

  getStrictOrSimpleJson(stringValue, strictJsonFormat, format) {
    try {
      if (stringValue && stringValue.length > 0) {
        const toReturn = Helpers.parseJson(stringValue);
        if (format === "yaml") {
          return Helpers.stringifyYAML(toReturn);
        }
        return Helpers.stringifyJson(toReturn, strictJsonFormat);
      }
    } catch (e) {
      return `/* \nInvalid output. Make sure your object specifications are defined correctly. \nDetails: ${e.message}\n*/\n ${stringValue}`;
    }
  },

  getQuotedStringOnly(value, quoteChar) {
    let valueType = typeof value;
    switch (valueType) {
      case "object":
        try {
          return JSON.stringify(value);
        } catch (e) {
          console.log(e.message);
          return null;
        }
      case "boolean":
        if (this.isTrue(value)) return true;
        else if (this.isFalse(value)) return false;
        else return null;
      case "number":
      case "bigint":
        return +value;
      case "string":
        if (value === " ") return `${quoteChar} ${quoteChar}`;
        if (this.isNull(value)) return null;
        if (this.isTrue(value)) return true;
        if (this.isFalse(value)) return false;
        if (this.isNumber(value)) return +value;
        return `${quoteChar}${value}${quoteChar}`;
      case "undefined":
        return null;
      default:
        return `${quoteChar}${value}${quoteChar}`;
    }
  },

  formatDate(date) {
    try {
      return moment(date).format("DD.MM.YYYY hh:mm");
    } catch (e) {
      return date;
    }
  },

  getCode: function (prop, propName, quote) {
    if (prop !== null && prop !== "" && prop !== undefined) {
      return propName + ":" + quote + prop + quote;
    } else return null;
  },

  getCodeSwitch: function (prop, propName, quote) {
    if (prop !== null && prop !== false && prop !== undefined) {
      return propName + ":" + quote + prop + quote;
    } else return null;
  },

  getCodeSelect: function (prop, propName, quote) {
    if (prop !== null && prop !== "na" && prop !== undefined) {
      return propName + ":" + quote + prop + quote;
    } else return null;
  },

  getArraySpaceDelimited: function (array, removeNulls) {
    if (removeNulls === true) {
      array = _.compact(array);
    }
    var cnt = _.size(array);
    var toReturn = "";
    var i = 1;

    if (cnt > 0) {
      for (var obj of array) {
        toReturn += obj;
        if (i < cnt) {
          toReturn += " ";
        }
        i++;
      }
    }
    return toReturn;
  },

  getArrayValues: function (array, removeNulls, startChar, endChar) {
    if (removeNulls === true) {
      array = _.compact(array);
    }
    var cnt = _.size(array);
    var toReturn = "";
    var i = 1;

    if (cnt > 0) {
      toReturn += startChar + "\n";
      for (var obj of array) {
        toReturn += obj;
        if (i < cnt) {
          toReturn += ",\n";
        }
        i++;
      }
      toReturn += endChar + "\n";
    }
    return toReturn;
  },

  removeNewLinesFromStringifiedJson(stringifiedJson) {
    return stringifiedJson.replace(/\\n/g, "");
  },

  addQuotesToKeys(jsonData) {
    return jsonData.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ');
  },

  removeCurlyBraces(str) {
    try {
      if (str !== "") {
        // remove }
        str = str.replace(/}([^}]*)$/, "$1");
        // remove whitespaces and trailing ,
        str = str.replace(/,\s*$/g, "");
        // remove {
        return str.replace("{", "");
      }
    } catch (e) {
      console.log(e.message, str);
    }
  },

  getEmptyObjectOrValue(value, shortenString) {
    if (value === null) {
      return "null";
    }
    if (_.isObjectLike(value) && _.isEmpty(value)) {
      if (Array.isArray(value)) {
        return "[]";
      } else {
        return "{}";
      }
    }

    return shortenString
      ? JsonSchemaHelpers.shortenLongText(JSON.stringify(value), 800)
      : JSON.stringify(value);
  },

  replaceSingleApostroph: function(string) {
    return `${string ? string.replace(/\'/g, '\\\'') : ''}`;
  },

  escape: function (key, val) {
    if (typeof val != "string") return val;
    return (
      val
        .replace(/[\\]/g, "\\\\")
        // eslint-disable-next-line
        .replace(/[\/]/g, "\\/")
        .replace(/[\b]/g, "\\b")
        .replace(/[\f]/g, "\\f")
        .replace(/[\n]/g, "\\n")
        .replace(/[\r]/g, "\\r")
        .replace(/[\t]/g, "\\t")
        // eslint-disable-next-line
        .replace(/[\"]/g, '\\"')
        .replace(/\\'/g, '\\"')
    );
  },
  getObjectCodeOrCustomCode: function (object, pName) {
    var toReturn = "";
    if (object[pName] && object[pName].length > 0) toReturn += object[pName];
    return toReturn;
  }
};
export default Helpers;
