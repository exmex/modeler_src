import Helpers from "../../helpers/helpers";
import JsonSchemaHelpers from "./helpers_jsonschema";
import { ModelTypes } from "common";
import { TableObjectTypesJson } from "./class_table_jsonschema";
import _ from "lodash";
import json5 from "json5";

export const getNestedColCode = (
  col,
  tables,
  {
    generateNames,
    generateBrackets,
    q,
    definitionKeyName,
    strictJsonFormat,
    catalogColumns
  }
) => {
  var code = "";
  const internalNestedTableObjectType = tables[col.datatype]?.objectType;
  const addBrackets =
    internalNestedTableObjectType !== TableObjectTypesJson.TRUE &&
    internalNestedTableObjectType !== TableObjectTypesJson.FALSE;
  const isObjectNameQuotedOrNotEmpty =
    _.size(col.name) > 0 || (_.size(col.name) === 0 && _.size(q) > 0);
  const shouldWrapObject =
    generateNames &&
    !JsonSchemaHelpers.isJsonSchemaKey(internalNestedTableObjectType) &&
    !JsonSchemaHelpers.isCondition(internalNestedTableObjectType) &&
    !JsonSchemaHelpers.isChoice(internalNestedTableObjectType) &&
    !JsonSchemaHelpers.isNot(internalNestedTableObjectType) &&
    isObjectNameQuotedOrNotEmpty;

  if (shouldWrapObject) {
    code += q + col.name + q + ": " + (addBrackets ? "{" : "");
  }
  if (generateBrackets && addBrackets) {
    code += "{";
  }

  const tempArr = [];
  tempArr.push(
    getCodeByColumnType(col, tables, {
      q,
      definitionKeyName,
      strictJsonFormat,
      catalogColumns
    })
  );
  code += Helpers.getArrayValues(tempArr, true, "", "");

  if (generateBrackets && addBrackets) {
    code += "}";
  }
  if (shouldWrapObject) {
    code += addBrackets ? "}" : "";
  }
  return code;
};

export const getNested = (
  table,
  tables,
  {
    generateNames,
    generateBrackets,
    definitionKeyName,
    catalogColumns,
    q,
    strictJsonFormat
  }
) => {
  var code = "";

  if (table) {
    if (table.objectType === TableObjectTypesJson.TRUE) {
      return "true";
    }
    if (table.objectType === TableObjectTypesJson.FALSE) {
      return "false";
    }

    var i = 0;
    var cnt = _.size(table?.cols);

    for (var col of table.cols) {
      if (col) {
        i++;
        code += getNestedColCode(col, tables, {
          generateBrackets,
          generateNames,
          q,
          definitionKeyName,
          strictJsonFormat,
          catalogColumns
        });
      }
      i < cnt && (code += ", ");
    }
  }
  return code;
};

export const getCodeByColumnType = (
  col,
  tables,
  { q, strictJsonFormat, definitionKeyName, catalogColumns }
) => {
  const internalNestedTableObjectType = tables[col.datatype]?.objectType;
  switch (internalNestedTableObjectType) {
    case TableObjectTypesJson.KEYOBJECT:
      return getKeyObjectCode(col, tables, {
        q,
        definitionKeyName,
        strictJsonFormat,
        catalogColumns
      });
    case TableObjectTypesJson.KEYARRAY:
      return getKeyArrayCode(col, tables, {
        q,
        definitionKeyName,
        strictJsonFormat,
        catalogColumns
      });
    case TableObjectTypesJson.NULL:
    case TableObjectTypesJson.NUMBER:
    case TableObjectTypesJson.STRING:
    case TableObjectTypesJson.BOOLEAN:
    case TableObjectTypesJson.INTEGER:
      return getBasicDataTypeCode(col, tables, {
        q,
        definitionKeyName,
        strictJsonFormat,
        catalogColumns
      });
    case TableObjectTypesJson.TRUE:
      return "true";
    case TableObjectTypesJson.FALSE:
      return "false";
    case TableObjectTypesJson.OBJECT:
      return getObjectCode(col, tables, {
        q,
        definitionKeyName,
        strictJsonFormat,
        catalogColumns
      });
    case TableObjectTypesJson.ARRAY:
      return getArrayCode(col, tables, {
        q,
        definitionKeyName,
        strictJsonFormat,
        catalogColumns
      });
    case TableObjectTypesJson.IF:
    case TableObjectTypesJson.THEN:
    case TableObjectTypesJson.ELSE:
      return getConditionCode(col, tables, {
        q,
        definitionKeyName,
        strictJsonFormat,
        catalogColumns
      });
    case TableObjectTypesJson.NOT:
      return getConditionCodeNot(col, tables, {
        q,
        definitionKeyName,
        strictJsonFormat,
        catalogColumns
      });
    case TableObjectTypesJson.ALLOF:
    case TableObjectTypesJson.ANYOF:
    case TableObjectTypesJson.ONEOF:
      return getChoiceCode(col, tables, {
        q,
        definitionKeyName,
        strictJsonFormat,
        catalogColumns
      });
    case TableObjectTypesJson.ANY:
      return getAnyCode(col, tables, {
        q,
        definitionKeyName,
        strictJsonFormat,
        catalogColumns
      });
    case TableObjectTypesJson.MULTI:
      return getMultiCode(col, tables, {
        q,
        definitionKeyName,
        strictJsonFormat,
        catalogColumns
      });
    case TableObjectTypesJson.INTERNAL:
      return "";

    default:
      if (tables[col.datatype]) {
        return getObjectCode(col, tables, {
          definitionKeyName,
          q,
          strictJsonFormat,
          catalogColumns
        });
      } else {
        return "";
      }
  }
};

function shouldGenerateType(type) {
  return (
    type !== TableObjectTypesJson.ANY && type !== TableObjectTypesJson.MULTI
  );
}

function wrapRefCode(refCode, { q }) {
  return q + "$ref" + q + ": " + q + refCode + q;
}

function getSchemaDefinition(projectType, schema, q) {
  switch (projectType) {
    case ModelTypes.OPENAPI:
      if (schema.includes("2.0")) {
        return `${q}swagger${q}: ${q}${schema}${q}`;
      } else {
        return `${q}openapi${q}: ${q}${schema}${q}`;
      }
    case ModelTypes.JSONSCHEMA:
    default:
      return `${q}$schema${q}: ${q}${schema}${q}`;
  }
}

export const getJsonSchemaDefineStatement = (
  table,
  tables,
  {
    quotations,
    definitionKeyName,
    skipDefs,
    strictJsonFormat,
    catalogColumns,
    projectType
  }
) => {
  var q = quotations;

  if (!!table) {
    if (table.objectType === TableObjectTypesJson.TRUE) {
      return "true";
    }
    if (table.objectType === TableObjectTypesJson.FALSE) {
      return "false";
    }

    var tempSchemaArr = [];
    var code = "{";
    if (!!table.schema) {
      tempSchemaArr.push(getSchemaDefinition(projectType, table.schema, q));
    }

    tempSchemaArr.push(getDescription(table, { q }));
    if (shouldGenerateType(table.objectType)) {
      tempSchemaArr.push(`${q}type${q}: ${q}${table.objectType}${q}`);
    }
    pushTableSpecification(table, tables, tempSchemaArr, {
      q: quotations,
      strictJsonFormat
    });
    tempSchemaArr.push(
      getNested(table, tables, {
        q,
        generateNames: true,
        generateBrackets: false,
        definitionKeyName,
        strictJsonFormat,
        catalogColumns
      })
    );
    !skipDefs &&
      tempSchemaArr.push(
        getDefsCode(tables, {
          definitionKeyName,
          strictJsonFormat,
          q,
          catalogColumns
        })
      );
    code += Helpers.getArrayValues(tempSchemaArr, true, "", "");
  }

  code += "}";
  return code.trim();
};

function pushTableSpecification(
  table,
  tables,
  tempSchemaArr,
  { strictJsonFormat, q }
) {
  const generatedSpec = getSpecTable(table, tables, { q, strictJsonFormat });
  generatedSpec && tempSchemaArr.push(generatedSpec);
}

function getRequiredFromPropertyNN(table, tables) {
  let req = [];
  if (table) {
    for (const col of table.cols) {
      if (
        col.name === "properties" &&
        tables[col.datatype].objectType === "keyObject"
      ) {
        req = _.reduce(
          _.filter(tables[col.datatype].cols, (col) => col.nn),
          (res, col) => {
            res.push(col.name);
            return res;
          },
          req
        );
      }
    }
  }
  return req;
}

function generateRequiredFields(requiredFields, { q }) {
  const requiredFieldsText = _.map(
    requiredFields,
    (colName) => `${q}${colName}${q}`
  ).join(",");
  return `${q}required${q}: [${requiredFieldsText}]`;
}

function updateSpecObject(requiredFields, specificationText) {
  const specObject = Helpers.parseJson(specificationText);
  if (
    _.isArray(specObject?.required) &&
    _.every(specObject.required, _.isString)
  ) {
    requiredFields = [...requiredFields, ...specObject.required];
  }
  return { ...specObject, required: requiredFields };
}

function mergeSpecificationRequiredFromNN(
  specificationText,
  requiredFields,
  { q, strictJsonFormat }
) {
  if (specificationText === "" || specificationText === undefined) {
    if (_.isEmpty(requiredFields)) {
      return undefined;
    } else {
      return generateRequiredFields(requiredFields, { q });
    }
  } else {
    if (_.isEmpty(requiredFields)) {
      return Helpers.removeCurlyBraces(specificationText);
    } else {
      try {
        const updatedSpecObject = updateSpecObject(
          requiredFields,
          specificationText
        );
        if (_.isEmpty(updatedSpecObject)) {
          return undefined;
        }
        const updatedSpecText = Helpers.stringifyJson(
          updatedSpecObject,
          strictJsonFormat
        );
        return Helpers.removeCurlyBraces(updatedSpecText);
      } catch (e) {
        console.log(e);
        return specificationText;
      }
    }
  }
}

function getSpecTable(table, tables, { q, strictJsonFormat }) {
  const requiredFromPropertyNN = getRequiredFromPropertyNN(table, tables);
  return mergeSpecificationRequiredFromNN(
    table.specification,
    requiredFromPropertyNN,
    {
      q,
      strictJsonFormat
    }
  );
}

function getSpecCol(col, tables, { q, strictJsonFormat }) {
  const req = getRequiredFromPropertyNN(
    !JsonSchemaHelpers.isDefOrRef(tables[col.datatype])
      ? tables[col.datatype]
      : undefined,
    tables
  );
  return mergeSpecificationRequiredFromNN(col.specification, req, {
    q,
    strictJsonFormat
  });
}

function getDefsCode(
  tables,
  { q, definitionKeyName, strictJsonFormat, catalogColumns }
) {
  var defs = _.filter(tables, function (o) {
    return JsonSchemaHelpers.isDef(o) === true;
  });
  var code = "";
  if (_.size(defs) > 0) {
    code += q + definitionKeyName + q + ": {";

    const defsCode = _.map(defs, (def) => {
      if (def.objectType === TableObjectTypesJson.TRUE) {
        return q + def.name + q + ": true";
      }
      if (def.objectType === TableObjectTypesJson.FALSE) {
        return q + def.name + q + ": false";
      }
      let innerCode = q + def.name + q + ": {";
      let tempArr = [];
      tempArr.push(getTableTypeAndSpec(def, tables, { q, strictJsonFormat }));
      tempArr.push(getRef(def, tables, { q, definitionKeyName }));
      tempArr.push(getDescription(def, { q }));
      tempArr.push(
        getNested(def, tables, {
          generateNames: true,
          generateBrackets: false,
          definitionKeyName,
          q,
          strictJsonFormat,
          catalogColumns
        })
      );
      innerCode += Helpers.getArrayValues(tempArr, true, "", "");
      innerCode += "}";
      return innerCode;
    });

    code += Helpers.getArrayValues(defsCode, true, "", "");

    code += "}";
  }
  return code.trim();
}

export const getAnyCode = (
  col,
  tables,
  { definitionKeyName, q, strictJsonFormat, catalogColumns }
) => {
  var code = "";
  var tempArr = [];
  tempArr.push(getDescription(col, { q }));
  const refCode = getRefCode(col, tables, {
    q,
    definitionKeyName,
    catalogColumns,
    strictJsonFormat
  });
  if (refCode !== "") {
    tempArr.push(wrapRefCode(refCode, { q }));
    pushColSpecification(col, tables, tempArr, { q, strictJsonFormat });
  } else {
    tempArr.push(getTypeAndSpec(col, tables, { q, strictJsonFormat }));
    tempArr.push(getRefFieldValue(col, tables, { q }));
    tempArr.push(
      getNested(tables[col.datatype], tables, {
        generateNames: true,
        generateBrackets: false,
        q,
        definitionKeyName,
        strictJsonFormat,
        catalogColumns
      })
    );
  }
  code += Helpers.getArrayValues(tempArr, true, "", "");
  return code.trim();
};

export const getMultiCode = (
  col,
  tables,
  { definitionKeyName, q, strictJsonFormat, catalogColumns }
) => {
  var code = "";
  var tempArr = [];
  tempArr.push(getDescription(col, { q }));
  const refCode = getRefCode(col, tables, {
    definitionKeyName,
    catalogColumns,
    strictJsonFormat
  });
  if (refCode !== "") {
    tempArr.push(wrapRefCode(refCode, { q }));
    pushColSpecification(col, tables, tempArr, { q, strictJsonFormat });
  } else {
    tempArr.push(getTypeAndSpec(col, tables, { q, strictJsonFormat }));

    tempArr.push(
      getNested(tables[col.datatype], tables, {
        q,
        generateNames: false,
        generateBrackets: false,
        definitionKeyName,
        strictJsonFormat,
        catalogColumns
      })
    );
  }
  code += Helpers.getArrayValues(tempArr, true, "", "");
  return code.trim();
};

export const getKeyObjectCode = (
  col,
  tables,
  { q, definitionKeyName, strictJsonFormat, catalogColumns }
) => {
  var tempArr = [];
  var code = q + col.name + q + ": {";
  tempArr.push(getTypeAndSpec(col, tables, { q, strictJsonFormat }));
  tempArr.push(getDescription(col, { q }));
  tempArr.push(
    getNested(tables[col.datatype], tables, {
      generateNames: true,
      generateBrackets: false,
      definitionKeyName,
      q,
      strictJsonFormat,
      catalogColumns
    })
  );
  code += Helpers.getArrayValues(tempArr, true, "", "");
  code += "}";
  return code.trim();
};

export const getKeyArrayCode = (
  col,
  tables,
  { q, definitionKeyName, strictJsonFormat, catalogColumns }
) => {
  var tempArr = [];
  var code = q + col.name + q + ": [";
  tempArr.push(getTypeAndSpec(col, tables, { q, strictJsonFormat }));
  tempArr.push(getDescription(col, { q }));
  tempArr.push(
    getNested(tables[col.datatype], tables, {
      generateNames: false,
      generateBrackets: true,
      definitionKeyName,
      strictJsonFormat,
      q,
      catalogColumns
    })
  );
  code += Helpers.getArrayValues(tempArr, true, "", "");
  code += "]";
  return code.trim();
};

export const getBasicDataTypeCode = (
  col,
  tables,
  { definitionKeyName, q, strictJsonFormat, catalogColumns }
) => {
  var tempArr = [];
  var code = "";

  tempArr.push(getDescription(col, { q }));
  const refCode = getRefCode(col, tables, {
    definitionKeyName,
    catalogColumns,
    strictJsonFormat
  });
  if (refCode !== "") {
    tempArr.push(wrapRefCode(refCode, { q }));
    pushColSpecification(col, tables, tempArr, { q, strictJsonFormat });
  } else {
    tempArr.push(getTypeAndSpec(col, tables, { q, strictJsonFormat }));
    tempArr.push(
      getNested(tables[col.datatype], tables, {
        generateNames: true,
        generateBrackets: false,
        definitionKeyName,
        q,
        strictJsonFormat,
        catalogColumns
      })
    );
  }
  code += Helpers.getArrayValues(tempArr, true, "", "");
  return code.trim();
};

export const getTableTypeAndSpec = (obj, tables, { q, strictJsonFormat }) => {
  var code = "";
  if (
    obj.objectType &&
    !tables[obj.objectType] &&
    obj.objectType !== TableObjectTypesJson.ANY
  ) {
    code += q + "type" + q + ": " + q + obj.objectType + q;
  }
  const generatedSpec = getSpecTable(obj, tables, { q, strictJsonFormat });
  if (generatedSpec) {
    code += (code.length > 0 ? "," : "") + generatedSpec;
  }
  return code.trim();
};

export const getRef = (obj, tables, { q, definitionKeyName }) => {
  if (obj.objectType && tables[obj.objectType]) {
    const targetDefs = tables[obj.objectType];
    return (
      q +
      "$ref" +
      q +
      ": " +
      q +
      `#/${definitionKeyName}/${targetDefs.name}` +
      q
    );
  }
  return undefined;
};

export const getRefFieldValue = (obj, tables, { q }) => {
  const internalNestedTableObjectType = tables[obj.datatype]?.objectType;
  if (
    internalNestedTableObjectType === TableObjectTypesJson.ANY &&
    obj.ref !== undefined &&
    obj.ref !== ""
  ) {
    return q + "$ref" + q + ": " + q + obj.ref + q;
  }
};

const convertToSingleLineString = (str) =>
  str ? str.split("\n").join("\\n").replaceAll('"', '\\"') : str;

export const getDescription = (obj, { q }) => {
  var code = "";
  if (!!obj.comment) {
    code += `${q}description${q}: ${q}${convertToSingleLineString(
      obj.comment
    )}${q}`;
  } else if (!!obj.desc) {
    code += `${q}description${q}: ${q}${convertToSingleLineString(
      obj.desc
    )}${q}`;
  }
  return code.trim();
};

export const getTypeAndSpec = (col, tables, { strictJsonFormat, q }) => {
  const internalNestedTableObjectType = tables[col.datatype]?.objectType;
  var code = "";

  if (
    internalNestedTableObjectType !== TableObjectTypesJson.ANY &&
    internalNestedTableObjectType !== TableObjectTypesJson.MULTI &&
    internalNestedTableObjectType !== TableObjectTypesJson.KEYARRAY &&
    internalNestedTableObjectType !== TableObjectTypesJson.KEYOBJECT
  ) {
    code += q + "type" + q + ": " + q + internalNestedTableObjectType + q;
  }
  const generatedSpec = getSpecCol(col, tables, { q, strictJsonFormat });
  if (generatedSpec) {
    code += (code.length > 0 ? "," : "") + generatedSpec;
  }
  return code.trim();
};

function pushColSpecification(col, tables, tempArr, { q, strictJsonFormat }) {
  const specCol = getSpecCol(col, tables, { q, strictJsonFormat });
  specCol && tempArr.push(specCol);
}

function getDefSchemaId(table) {
  try {
    let spec = json5.parse(table.specification);
    if (spec.$id) {
      return spec.$id;
    }
  } catch (e) {
    return "";
  }
}

const getUri = (value) => {
  try {
    return new URL(value);
  } catch {
    return undefined;
  }
};

export const getRefCode = (
  col,
  tables,
  { definitionKeyName, catalogColumns }
) => {
  var code = "";

  if (col) {
    if (tables[col.datatype]) {
      if (
        JsonSchemaHelpers.isReferenced(col, tables, catalogColumns) &&
        col.useSchemaId
      ) {
        code += JsonSchemaHelpers.getColDataType(
          col,
          tables,
          true,
          catalogColumns
        );
      } else if (JsonSchemaHelpers.isReferenced(col, tables, catalogColumns)) {
        const value = JsonSchemaHelpers.getColDataType(
          col,
          tables,
          false,
          catalogColumns
        );
        code += `#/${definitionKeyName}/${value}`;
      } else if (
        JsonSchemaHelpers.isDef(tables[col.datatype]) &&
        col.useSchemaId
      ) {
        code += getDefSchemaId(tables[col.datatype]);
      } else if (JsonSchemaHelpers.isDef(tables[col.datatype])) {
        const defName = tables[col.datatype]?.name;
        const uri = getUri(defName);
        code += uri ? uri.pathname : `#/${definitionKeyName}/${defName}`;
      } else if (JsonSchemaHelpers.isRef(tables[col.datatype])) {
        code += tables[col.datatype]?.refUrl;
      }
    }
  }
  return code.trim();
};

export const getObjectCode = (
  col,
  tables,
  { definitionKeyName, q, strictJsonFormat, catalogColumns }
) => {
  var tempArr = [];
  var code = "";

  if (col) {
    if (tables[col.datatype]) {
      tempArr.push(getDescription(col, { q }));
      const refCode = getRefCode(col, tables, {
        definitionKeyName,
        catalogColumns,
        strictJsonFormat
      });
      if (refCode !== "") {
        tempArr.push(wrapRefCode(refCode, { q }));
      } else {
        tempArr.push(q + "type" + q + ": " + q + "object" + q);
        const nested = getNested(tables[col.datatype], tables, {
          generateNames: true,
          generateBrackets: false,
          definitionKeyName,
          q,
          strictJsonFormat,
          catalogColumns
        });
        if (nested !== "") {
          tempArr.push(nested);
        }
      }
    }

    pushColSpecification(col, tables, tempArr, { q, strictJsonFormat });
  }
  code += Helpers.getArrayValues(tempArr, true, "", "");
  return code.trim();
};

export const getArrayCode = (
  col,
  tables,
  { definitionKeyName, q, strictJsonFormat, catalogColumns }
) => {
  var tempArr = [];
  var code = "";
  tempArr.push(getDescription(col, { q }));
  const refCode = getRefCode(col, tables, {
    q,
    definitionKeyName,
    catalogColumns,
    strictJsonFormat
  });
  if (refCode !== "") {
    tempArr.push(wrapRefCode(refCode, { q }));
  } else {
    tempArr.push(q + "type" + q + ": " + q + "array" + q);
    const nested = getNested(tables[col.datatype], tables, {
      generateNames: true,
      generateBrackets: false,
      definitionKeyName,
      q,
      strictJsonFormat,
      catalogColumns
    });
    if (nested !== "") {
      tempArr.push(nested);
    }
  }

  pushColSpecification(col, tables, tempArr, { q, strictJsonFormat });
  code += Helpers.getArrayValues(tempArr, true, "", "");

  return code.trim();
};

export const getConditionCode = (
  col,
  tables,
  { definitionKeyName, q, strictJsonFormat, catalogColumns }
) => {
  const internalNestedTableObjectType = tables[col.datatype]?.objectType;
  let code = q + internalNestedTableObjectType + q + ": {";
  var tempArr = [];
  tempArr.push(getDescription(col, { q }));
  tempArr.push(
    getNested(tables[col.datatype], tables, {
      generateNames: true,
      generateBrackets: false,
      q,
      definitionKeyName,
      strictJsonFormat,
      catalogColumns
    })
  );

  pushColSpecification(col, tables, tempArr, { q, strictJsonFormat });
  code += Helpers.getArrayValues(tempArr, true, "", "");
  code += "}";
  return code.trim();
};

export const getConditionCodeNot = (
  col,
  tables,
  { definitionKeyName, q, strictJsonFormat, catalogColumns }
) => {
  const internalNestedTableObjectType = tables[col.datatype]?.objectType;
  let code = q + internalNestedTableObjectType + q + ": {";
  var tempArr = [];
  tempArr.push(getDescription(col, { q }));
  tempArr.push(
    getNested(tables[col.datatype], tables, {
      generateNames: true,
      generateBrackets: false,
      definitionKeyName,
      q,
      strictJsonFormat,
      catalogColumns
    })
  );

  pushColSpecification(col, tables, tempArr, { q, strictJsonFormat });
  code += Helpers.getArrayValues(tempArr, true, "", "");
  code += "}";
  return code.trim();
};

export const getChoiceCode = (
  col,
  tables,
  { definitionKeyName, q, strictJsonFormat, catalogColumns }
) => {
  var tempArr = [];
  const internalNestedTableObjectType = tables[col.datatype]?.objectType;
  var code = "";
  code += q + internalNestedTableObjectType + q + ": [";
  tempArr.push(
    getNested(tables[col.datatype], tables, {
      generateNames: false,
      generateBrackets: true,
      q,
      definitionKeyName,
      strictJsonFormat,
      catalogColumns
    })
  );

  pushColSpecification(col, tables, tempArr, { q, strictJsonFormat });
  code += Helpers.getArrayValues(tempArr, true, "", "");
  code += "]";
  return code.trim();
};

export const getSpecificationStatementJsonSchema = (obj) => {
  return obj.specification;
};

export const generateJsonSchemaPartialScript = (
  tableId,
  colId,
  { tables, catalogColumns, jsonCodeSettings, type }
) => {
  const rootSchemaTable = JsonSchemaHelpers.getRootSchemaTable(tables);
  const definitionKeyName = JsonSchemaHelpers.getDefinitionKeyName(
    rootSchemaTable,
    { jsonCodeSettings, type }
  );

  const col = JsonSchemaHelpers.getColumnById(tables, tableId, colId);

  const parentTable = tables[tableId];

  const generateNames = ![
    TableObjectTypesJson.ALLOF,
    TableObjectTypesJson.ANYOF,
    TableObjectTypesJson.ONEOF,
    TableObjectTypesJson.KEYARRAY,
    TableObjectTypesJson.MULTI
  ].includes(parentTable.objectType);

  return getNestedColCode(col, tables, {
    generateBrackets: false,
    generateNames,
    catalogColumns: catalogColumns,
    q: '"',
    definitionKeyName,
    strictJsonFormat: jsonCodeSettings.strict
  });
};
