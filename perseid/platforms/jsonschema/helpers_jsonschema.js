import { KeyTypeNames, KeyTypes } from "./class_column_jsonschema";
import {
  TableControlTypesJson,
  TableObjectTypesJson
} from "./class_table_jsonschema";

import Helpers from "../../helpers/helpers";
import { ModelTypes } from "common";
import React from "react";
import _ from "lodash";
import json5 from "json5";

const JsonSchemaHelpers = {
  isRootOrDef(table) {
    return (
      table.nodeType === TableControlTypesJson.ROOT ||
      table.nodeType === TableControlTypesJson.SUBSCHEMA ||
      table.nodeType === TableControlTypesJson.EXTERNAL_REF
    );
  },
  getRootTableIdForTableId(tableId, tableToCol) {
    let current = tableToCol[tableId];
    while (current) {
      const next = tableToCol[current.parentTableId];
      if (!next) {
        return current.parentTableId;
      }
      current = next;
    }
    return tableId;
  },
  getDatatypeColByDatatypeTableId(tables, tableToCol, datatypeTableId) {
    const tableToColItem = tableToCol[datatypeTableId];
    if (!tableToColItem) {
      return undefined;
    }
    return _.find(
      tables[tableToColItem.parentTableId].cols,
      (col) => col.id === tableToColItem.parentColId
    );
  },
  getDatatypeTableByDatatypeColId(tables, colToTable, colId) {
    const table = colToTable[colId];
    return table
      ? tables[
          _.find(tables[table.belongsToTableId].cols, (col) => colId === col.id)
            .datatype
        ]
      : undefined;
  },
  sortOrder() {
    return [
      KeyTypes.KEYARRAY,
      KeyTypes.ALLOF,
      KeyTypes.ANYOF,
      KeyTypes.ONEOF,
      KeyTypes.NOT,
      KeyTypes.IF,
      KeyTypes.THEN,
      KeyTypes.ELSE,
      KeyTypeNames.DEFINITIONS.nameKey,
      KeyTypeNames.DEFS.nameKey
    ];
  },

  getSpecification(rootSchemaTable) {
    try {
      if (rootSchemaTable?.specification) {
        return Helpers.parseJson(rootSchemaTable.specification);
      }
      return {};
    } catch {
      return {};
    }
  },

  getDefinitionKeyNameBySchema(rootSchemaTable, { type }) {
    if (type === ModelTypes.OPENAPI) {
      switch (rootSchemaTable?.schema?.substring(0, 3)) {
        case "2.0":
        case "3.0":
          return "definitions";
        default:
          return "$defs";
      }
    }
    const specification = JsonSchemaHelpers.getSpecification(rootSchemaTable);

    if (!!specification?.swagger) {
      return "definitions";
    }

    const schema = rootSchemaTable?.schema ?? specification?.$schema;

    switch (schema) {
      case "http://json-schema.org/draft-07/schema#":
      case "http://json-schema.org/draft-07/schema":
      case "https://json-schema.org/draft-07/schema#":
      case "https://json-schema.org/draft-07/schema":
      case "http://json-schema.org/draft-06/schema#":
      case "http://json-schema.org/draft-06/schema":
      case "https://json-schema.org/draft-06/schema#":
      case "https://json-schema.org/draft-06/schema":
      case "http://json-schema.org/draft-04/schema#":
      case "http://json-schema.org/draft-04/schema":
      case "https://json-schema.org/draft-04/schema#":
      case "https://json-schema.org/draft-04/schema":
        return "definitions";
      case "https://json-schema.org/draft/2019-09/schema":
      case "https://json-schema.org/draft/2020-12/schema":
      default:
        return "$defs";
    }
  },
  getDefinitionKeyName(rootSchemaTable, { jsonCodeSettings, type }) {
    switch (jsonCodeSettings.definitionKeyName) {
      case "definitions": {
        return "definitions";
      }
      case "defs": {
        return "$defs";
      }
      default: {
        return JsonSchemaHelpers.getDefinitionKeyNameBySchema(rootSchemaTable, {
          type
        });
      }
    }
  },

  getJsonSchemasArray() {
    return [
      {
        shortName: "Draft 2020-12",
        longName: "https://json-schema.org/draft/2020-12/schema"
      },
      {
        shortName: "Draft 2019-09",
        longName: "https://json-schema.org/draft/2019-09/schema"
      },
      {
        shortName: "Draft 7",
        longName: "http://json-schema.org/draft-07/schema#"
      },
      {
        shortName: "Draft 6",
        longName: "http://json-schema.org/draft-06/schema#"
      },
      {
        shortName: "Draft 4",
        longName: "http://json-schema.org/draft-04/schema#"
      }
    ];
  },

  getOpenApiVersionsArray() {
    return [
      {
        shortName: "3.1.0",
        longName: "3.1.0"
      },
      {
        shortName: "3.0.3",
        longName: "3.0.3"
      },
      {
        shortName: "3.0.2",
        longName: "3.0.2"
      },
      {
        shortName: "3.0.1",
        longName: "3.0.1"
      },
      {
        shortName: "3.0.0",
        longName: "3.0.0"
      },
      {
        shortName: "2.0",
        longName: "2.0"
      }
    ];
  },

  makeSelectSchemas(arrayOfObjects) {
    return _.map(arrayOfObjects, (obj) => {
      return (
        <option key={obj.shortName} value={obj.longName}>
          {obj.shortName}
        </option>
      );
    });
  },

  getSchemaShortName(uri) {
    const schema = _.find(this.getJsonSchemasArray(), ["longName", uri]);
    if (schema && schema.shortName) {
      return schema.shortName;
    } else {
      return uri;
    }
  },

  rootSortOrder() {
    return [TableObjectTypesJson.REF];
  },

  isChoice(type) {
    return (
      type === TableObjectTypesJson.ALLOF ||
      type === TableObjectTypesJson.ANYOF ||
      type === TableObjectTypesJson.ONEOF
    );
  },

  isCondition(name) {
    name = _.toLower(name);
    return (
      name === KeyTypes.IF ||
      name === KeyTypes.THEN ||
      name === KeyTypes.ELSE
    );
  },

  isNot(type) {
    return type === TableObjectTypesJson.NOT;
  },

  isThen(type) {
    return type === TableObjectTypesJson.THEN;
  },

  isElse(type) {
    return type === TableObjectTypesJson.ELSE;
  },

  isJsonSchemaKey(type) {
    return (
      type === TableObjectTypesJson.KEYARRAY ||
      type === TableObjectTypesJson.KEYOBJECT
    );
  },

  isSchema(obj) {
    return obj.embeddable === false;
  },

  isDef(obj) {
    return (
      obj.embeddable === true &&
      JsonSchemaHelpers.isRootOrDef(obj) &&
      obj.objectType !== TableObjectTypesJson.REF
    );
  },

  isRef(obj) {
    return obj.objectType === TableObjectTypesJson.REF;
  },

  isKeyArray(type) {
    return type === TableObjectTypesJson.KEYARRAY;
  },

  isDefOrRef(obj) {
    if (!obj) {
      return false;
    }
    return obj.embeddable === true && JsonSchemaHelpers.isRootOrDef(obj);
  },

  isRootObjectInDiagramTree(obj) {
    return JsonSchemaHelpers.isRootOrDef(obj);
  },

  isArrayLike(type) {
    return this.isChoice(type) || type === TableObjectTypesJson.KEYARRAY;
  },

  isReserverdCaption(caption) {
    const reservedCaptions = this.getReservedCaptions();
    return _.includes(reservedCaptions, caption);
  },

  isReservedKeyObjectName(caption) {
    const reservedKeyObjectNames = this.getReservedKeyObjectNames();
    return _.includes(reservedKeyObjectNames, caption);
  },

  isReserverdKeyCaption(caption) {
    const reservedKeyCaptions = this.getReservedKeyCaptions();
    return _.includes(reservedKeyCaptions, caption);
  },

  getRootTypeStyle(obj) {
    if (this.isDef(obj)) {
      return "tree__definition";
    }
    if (this.isSchema(obj)) {
      return "tree__schema";
    }
    if (this.isRef(obj)) {
      return "tree__ref";
    }
  },

  getJsonSchemaDataTypes(isJSONSchema) {
    const schemaBooleanTypes = isJSONSchema
      ? [
          ["true (schema)", TableObjectTypesJson.TRUE],
          ["false (schema)", TableObjectTypesJson.FALSE]
        ]
      : [];

    let toReturn = [
      ["any", TableObjectTypesJson.ANY],
      ["array", TableObjectTypesJson.ARRAY],
      ["boolean", TableObjectTypesJson.BOOLEAN],
      ["integer", TableObjectTypesJson.INTEGER],
      ["multi", TableObjectTypesJson.MULTI],
      ["null", TableObjectTypesJson.NULL],
      ["number", TableObjectTypesJson.NUMBER],
      ["object", TableObjectTypesJson.OBJECT],
      ["string", TableObjectTypesJson.STRING],
      ...schemaBooleanTypes
    ];
    return toReturn;
  },

  getJsonSchemaBasicDataTypes() {
    return [
      TableObjectTypesJson.BOOLEAN,
      TableObjectTypesJson.INTEGER,
      TableObjectTypesJson.NULL,
      TableObjectTypesJson.NUMBER,
      TableObjectTypesJson.STRING,
      TableObjectTypesJson.TRUE,
      TableObjectTypesJson.FALSE
    ];
  },

  getReservedCaptions() {
    return [
      KeyTypeNames.DEFINITIONS.nameKey,
      KeyTypeNames.DEFS.nameKey,
      KeyTypeNames.PROPERTIES.nameKey,
      KeyTypeNames.PATTERN_PROPERTIES.nameKey,
      KeyTypeNames.ITEMS.nameKey,
      KeyTypeNames.DEPENDENT_SCHEMAS.nameKey,
      KeyTypeNames.PREFIX_ITEMS.nameKey,
      KeyTypeNames.SUBSCHEMA.nameKey,
      TableObjectTypesJson.ONEOF,
      TableObjectTypesJson.ALLOF,
      TableObjectTypesJson.ANYOF,
      TableObjectTypesJson.NOT,
      TableObjectTypesJson.IF,
      TableObjectTypesJson.THEN,
      TableObjectTypesJson.ELSE
    ];
  },

  getReservedKeyObjectNames() {
    return [
      KeyTypeNames.KEYOBJECT.nameKey,
      KeyTypeNames.KEYARRAY.nameKey,
      "keyObject",
      "keyArray"
    ];
  },

  getReservedKeyCaptions() {
    return [
      KeyTypeNames.DEFINITIONS.nameKey,
      KeyTypeNames.DEFS.nameKey,
      KeyTypeNames.PROPERTIES.nameKey,
      KeyTypeNames.PATTERN_PROPERTIES.nameKey,
      KeyTypeNames.DEPENDENT_SCHEMAS.nameKey,
      KeyTypeNames.SUBSCHEMA.nameKey
    ];
  },

  getReservedKeyCaptionsForRequired() {
    return [KeyTypeNames.PROPERTIES.nameKey];
  },

  getJsonSchemaParentObjectTypes() {
    return [
      TableObjectTypesJson.ANY,
      TableObjectTypesJson.OBJECT,
      TableObjectTypesJson.REF,
      TableObjectTypesJson.ARRAY,
      TableObjectTypesJson.BOOLEAN,
      TableObjectTypesJson.INTEGER,
      TableObjectTypesJson.MULTI,
      TableObjectTypesJson.NUMBER,
      TableObjectTypesJson.STRING,
      TableObjectTypesJson.TRUE,
      TableObjectTypesJson.FALSE,
      TableObjectTypesJson.NULL,
      TableObjectTypesJson.KEYARRAY,
      TableObjectTypesJson.KEYOBJECT,
      TableObjectTypesJson.INTERNAL,
      TableObjectTypesJson.SUBSCHEMA
    ];
  },

  getRootObjId(colId, tables) {
    let rootObjId = "";
    var rootObjects = _.filter(tables, function (o) {
      return JsonSchemaHelpers.isRootOrDef(o);
    });
    _.map(rootObjects, (rootObject) => {
      let searchResult = this.belongsTo(
        colId,
        rootObject,
        rootObject.id,
        tables,
        true
      );
      if (searchResult !== undefined) {
        rootObjId = searchResult;
      }
    });
    return rootObjId;
  },

  getDefinitionsTable(rootObject, allTables) {
    let definitionCol = _.find(rootObject.cols, function (c) {
      return c.name === "definitions" || c.name === "$defs";
    });

    if (definitionCol) {
      return allTables[definitionCol.datatype];
    } else {
      return undefined;
    }
  },

  belongsTo(colId, table, rootTableId, allTables, stopOnDef) {
    var toReturn = undefined;
    if (table && table.cols) {
      _.map(table.cols, (col) => {
        if (col.id === colId) {
          toReturn = rootTableId;
        } else {
          let tempBelongsTo = this.belongsTo(
            colId,
            allTables[col.datatype],
            rootTableId,
            allTables,
            stopOnDef
          );
          if (tempBelongsTo !== undefined) {
            if (stopOnDef && !this.isDef(allTables[col.datatype])) {
              toReturn = tempBelongsTo;
            }
            if (!stopOnDef) {
              toReturn = tempBelongsTo;
            }
          }
        }
      });
    }
    return toReturn;
  },

  canBeRequired(tableId, allTables, catalogColumns) {
    const reservedParentNodeNamesArray =
      this.getReservedKeyCaptionsForRequired();
    const table = allTables[tableId];

    const datatypeCol = JsonSchemaHelpers.getDatatypeColByDatatypeTableId(
      allTables,
      catalogColumns.tableToCol,
      tableId
    );

    const isTableKeyObject =
      table.objectType === TableObjectTypesJson.KEYOBJECT;
    const isParentColReserved =
      !!datatypeCol && reservedParentNodeNamesArray.includes(datatypeCol.name);
    return isParentColReserved && isTableKeyObject;
  },

  isReferenced(column, allTables, catalogColumns) {
    let toReturn = false;
    let rootObject = allTables[catalogColumns[column.id]?.rootTableId];
    if (rootObject) {
      let definitions = this.getDefinitionsTable(rootObject, allTables);

      if (_.size(definitions) > 0) {
        _.map(definitions.cols, (col) => {
          if (column.datatype === col.datatype && col.id !== column.id) {
            toReturn = true;
          }
        });
      }
    }
    return toReturn;
  },

  isReferencedSubschema(column, allTables) {
    return allTables[column.datatype] && this.isDef(allTables[column.datatype]);
  },

  getColDataType(column, allTables, showId, catalogColumns) {
    let toReturn = "";
    let rootObject = allTables[catalogColumns[column.id]?.rootTableId];
    if (rootObject) {
      let definitions = JsonSchemaHelpers.getDefinitionsTable(
        rootObject,
        allTables
      );
      if (definitions) {
        _.map(definitions.cols, (col) => {
          if (column.datatype === col.datatype && col.id !== column.id) {
            if (showId && column.useSchemaId) {
              try {
                let spec = Helpers.parseJson(col.specification);
                if (spec.$id) {
                  toReturn = spec.$id;
                }
              } catch (e) {
                toReturn = col.name;
              }
            } else {
              toReturn = col.name;
            }
          }
        });
      }
    }

    if (toReturn !== "") {
      return toReturn;
    }

    if (allTables[column.datatype] !== undefined) {
      if (
        allTables[column.datatype]?.name === TableObjectTypesJson.ANY ||
        JsonSchemaHelpers.isReserverdCaption(
          allTables[column.datatype]?.name
        ) ||
        allTables[column.datatype]?.name === "-" ||
        JsonSchemaHelpers.isReservedKeyObjectName(
          allTables[column.datatype]?.name
        )
      ) {
        return "";
      } else {
        return allTables[column.datatype]?.name;
      }
    } else {
      return column.datatype;
    }
  },

  convertToId(currentId, customDataTypes, modelType) {
    var datatypes = this.getJsonSchemaDataTypes(modelType);
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

  isPerseidModelType(modelType) {
    return (
      modelType === ModelTypes.JSONSCHEMA ||
      modelType === ModelTypes.OPENAPI ||
      modelType === ModelTypes.FULLJSON
    );
  },

  isOpenAPIdModelType(modelType) {
    return modelType === ModelTypes.OPENAPI;
  },

  isJSONSchemaModelType(modelType) {
    return modelType === ModelTypes.JSONSCHEMA;
  },

  getDefaultRootObjectName(modelType) {
    switch (modelType) {
      case ModelTypes.FULLJSON:
        return "root object";
      case ModelTypes.OPENAPI:
        return "Open API";
      case ModelTypes.JSONSCHEMA:
      default:
        return "JSON schema";
    }
  },

  getJsonSchemaDefaultEmbeddableType() {
    return `string`;
  },

  getJsonSchemaDefaultType() {
    return ``;
  },

  getJSONType() {
    return `string`;
  },

  getJsonSchemaKeyType() {
    return "";
  },

  getCustomKeyName(datatypeName) {
    switch (datatypeName) {
      case TableObjectTypesJson.OBJECT:
        return "properties";
      case TableObjectTypesJson.ARRAY:
        return "prefixItems";
      default:
        return "";
    }
  },

  makeDatatypesForRoot(colDatatype, tables, catalogColumns, modelType) {
    return this.makeDatatypes(
      colDatatype,
      tables,
      catalogColumns,
      modelType,
      modelType === ModelTypes.JSONSCHEMA
    );
  },

  makeDefObjectsDatatypes(colId, tables) {
    var defObjects = _.filter(tables, function (o) {
      return JsonSchemaHelpers.isDef(o);
    });
    var defsToShow = [];
    _.map(defObjects, (defObject) => {
      let searchResult = this.belongsTo(
        colId,
        defObject,
        defObject.id,
        tables,
        false
      );
      if (searchResult === undefined) {
        defsToShow.push([defObject.name, defObject.id]);
      }
    });
    return defsToShow;
  },

  makeRefObjectsDatatypes(colId, tables) {
    var refsObjects = _.filter(tables, function (o) {
      return JsonSchemaHelpers.isRef(o);
    });
    var refsToShow = [];
    _.map(refsObjects, (refObject) => {
      refsToShow.push([refObject.name, refObject.id]);
    });
    return refsToShow;
  },

  makeDatatypes(colId, tables, colToTable, modelType, isJSONSchema) {
    var datatypes = this.getJsonSchemaDataTypes(isJSONSchema);
    if (tables) {
      const tableToRender = JsonSchemaHelpers.getDatatypeTableByDatatypeColId(
        tables,
        colToTable,
        colId
      );
      var datatypesToRender = [];
      _.map(datatypes, (datatype) => {
        if (tableToRender && datatype[1] === tableToRender.name) {
          datatypesToRender.push([datatype[0], tableToRender.id]);
        } else {
          datatypesToRender.push(datatype);
        }
      });
    }

    let rootObject = tables[this.getRootObjId(colId, tables)];
    if (rootObject && modelType === ModelTypes.JSONSCHEMA) {
      let definitions = this.getDefinitionsTable(rootObject, tables);
      if (definitions) {
        _.map(definitions.cols, (col) => {
          if (col.id !== colId) {
            datatypesToRender.push([col.name + " (definition)", col.datatype]);
          }
        });
      }
    }

    var defsArray = this.makeDefObjectsDatatypes(colId, tables);
    datatypesToRender = [...datatypesToRender, ...defsArray];

    var refsArray = this.makeRefObjectsDatatypes(colId, tables);
    datatypesToRender = [...datatypesToRender, ...refsArray];

    return _.map(tables ? datatypesToRender : datatypes, (obj) => {
      return (
        <option key={obj[1]} value={obj[1]}>
          {obj[0]}
        </option>
      );
    });
  },

  getColNameJsonSchema(col, index, tableObjectType, tables) {
    const internalNestedTableObjectType = tables[col.datatype]?.objectType;
    const isParentKeyArray =
      this.isArrayLike(tableObjectType) &&
      (internalNestedTableObjectType !== TableObjectTypesJson.KEYARRAY ||
        internalNestedTableObjectType !== TableObjectTypesJson.KEYOBJECT);
    var colName = <>{col.name}</>;
    if (isParentKeyArray) {
      colName = (
        <span className="tree__key__text__mini">{"[" + index + "]"}</span>
      );
    }

    if(col.name === KeyTypes.IF || col.name === KeyTypes.THEN || col.name === KeyTypes.ELSE)
    {
      return <span className="tree__condition__text__mini">{colName}</span>;
    }

    switch (internalNestedTableObjectType) {
      
      case KeyTypes.ALLOF:
      case KeyTypes.ANYOF:
      case KeyTypes.ONEOF:
      case KeyTypes.NOT:
        return <span className="tree__choice__text__mini">{colName}</span>;
      case KeyTypes.KEYOBJECT:
        return (
          <>
            {this.getColNameDecorationForErDiagram(
              col.name,
              KeyTypes.KEYOBJECT
            )}
          </>
        );
      case KeyTypes.KEYARRAY:
        return (
          <>
            {this.getColNameDecorationForErDiagram(col.name, KeyTypes.KEYARRAY)}
          </>
        );

      default:
        return (
          <>
            <span className="tree__empty_decorator"></span>
            {colName}
          </>
        );
    }
  },

  shortenLongText(text, maxChars) {
    if (!!text) {
      return text.trim().length > maxChars
        ? text.trim().substring(0, maxChars) + "..."
        : text.trim();
    } else {
      return "";
    }
  },

  renderDataTypeIcon(column, allTables, catalogColumns) {
    if (
      JsonSchemaHelpers.isReferenced(column, allTables, catalogColumns) ||
      JsonSchemaHelpers.isReferencedSubschema(column, allTables)
    ) {
      return <span className="tree__icon__referenced">#</span>;
    }

    if (
      allTables[column.datatype] &&
      JsonSchemaHelpers.isRef(allTables[column.datatype])
    ) {
      return (
        <span className="tree__icon__referenced">
          <i className="im-icon-Linked"></i>
        </span>
      );
    }

    const name = JsonSchemaHelpers.getColDataType(
      column,
      allTables,
      false,
      catalogColumns
    );

    switch (name) {
      case TableObjectTypesJson.ARRAY:
        return <span className="tree__icon__object">[&nbsp;]</span>;
      case TableObjectTypesJson.OBJECT:
        return <span className="tree__icon__object">&#123;&nbsp;&#125;</span>;
      case TableObjectTypesJson.ANY:
      case TableObjectTypesJson.MULTI:
      case TableObjectTypesJson.STRING:
      case TableObjectTypesJson.INTEGER:
      case TableObjectTypesJson.NUMBER:
      case TableObjectTypesJson.BOOLEAN:
      case TableObjectTypesJson.NULL:
      case TableObjectTypesJson.TRUE:
      case TableObjectTypesJson.FALSE:
        return "";
      case TableObjectTypesJson.REF:
        return <span className="tree__icon_ref">#</span>;
      default:
        return "";
    }
  },

  renderKeyTypeIcon(tableObjectType, columnName) {
    switch (tableObjectType) {
      case KeyTypes.KEYARRAY:
        return <span className="tree__icon__array">[&nbsp;]</span>;
      case KeyTypes.KEYOBJECT:
        return this.renderKeyTypeIconByName(columnName);
      default:
        return <span className="tree__icon__def"></span>;
    }
  },

  renderKeyTypeIconByName(columnName) {
    switch (columnName) {
      case KeyTypeNames.DEFINITIONS.nameKey:
        return <span className="tree__icon__pattern">$</span>;
      case KeyTypeNames.DEFS.nameKey:
        return <span className="tree__icon__pattern">$</span>;
      case KeyTypeNames.PROPERTIES.nameKey:
        return (
          <span className="tree__icon__object">
            <i className="im-icon-DotsVerticallDouble16" />
          </span>
        );
      case KeyTypeNames.PATTERN_PROPERTIES.nameKey:
        return <span className="tree__icon__pattern">^$</span>;
      case KeyTypeNames.SUBSCHEMA.namePlural:
        return (
          <span className="tree__icon__ref">
            <i className="im-icon-Table" />
          </span>
        );
      case KeyTypeNames.DEPENDENT_SCHEMAS.nameKey:
        return (
          <span className="tree__icon__object">
            <i className="im-icon-ArrowLeft16" />
          </span>
        );
      default:
        return <span className="tree__icon__object">&#123;&nbsp;&#125;</span>;
    }
  },

  getColNameDecorationForErDiagram(colName, type) {
    switch (colName) {
      case KeyTypeNames.DEFINITIONS.nameKey:
        return (
          <span className="tree__key__text__mini">
            <span className="tree__icon__pattern">$</span>
            {colName}
          </span>
        );
      case KeyTypeNames.DEFS.nameKey:
        return (
          <span className="tree__key__text__mini">
            <span className="tree__icon__pattern">$</span>
            {colName}
          </span>
        );
      case KeyTypeNames.PROPERTIES.nameKey:
        return (
          <span className="tree__key__text__mini">
            <span className="tree__icon__object">
              <i className="im-icon-DotsVerticallDouble16" />
            </span>
            {colName}
          </span>
        );
      case KeyTypeNames.PATTERN_PROPERTIES.nameKey:
        return (
          <span className="tree__key__text__mini">
            <span className="tree__icon__pattern">^$</span>
            {colName}
          </span>
        );
      case KeyTypeNames.DEPENDENT_SCHEMAS.nameKey:
        return (
          <span className="tree__key__text__mini">
            <span className="tree__icon__object">
              <i className="im-icon-ArrowLeft16"></i>
            </span>
            {colName}
          </span>
        );
      case KeyTypeNames.PREFIX_ITEMS.nameKey:
        return (
          <span className="tree__key__text__mini">
            <span className="tree__icon__array__mini">[&nbsp;]</span>
            {colName}
          </span>
        );
      case KeyTypeNames.ITEMS.nameKey:
        return (
          <span className="tree__key__text__mini">
            <span className="tree__icon__object__mini">&#123;&nbsp;&#125;</span>
            {colName}
          </span>
        );
      default:
        return type === KeyTypes.KEYOBJECT ? (
          <span className="tree__key__text__mini">
            <span className="tree__icon__object__mini">&#123;&nbsp;&#125;</span>
            {colName}
          </span>
        ) : (
          <span className="tree__key__text__mini">
            <span className="tree__icon__array__mini">[&nbsp;]</span>
            {colName}
          </span>
        );
    }
  },

  getActiveColumn(allTables, matchParamTableId, matchParamColId) {
    return _.find(allTables[matchParamTableId].cols, ["id", matchParamColId]);
  },

  getContentMediaType() {
    return [
      "",
      "text/plain",
      "text/html",
      "application/xml",
      "audio/aac",
      "application/x-abiword",
      "application/x-freearc",
      "image/avif",
      "video/x-msvideo",
      "application/vnd.amazon.ebook",
      "application/octet-stream",
      "image/bmp",
      "application/x-bzip",
      "application/x-bzip2",
      "application/x-cdf",
      "application/x-csh",
      "text/css",
      "text/csv",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-fontobject",
      "application/epub+zip",
      "application/gzip",
      "image/gif",
      "image/vnd.microsoft.icon",
      "text/calendar",
      "application/java-archive",
      "image/jpeg",
      "text/javascript",
      "application/json",
      "application/ld+json",
      "audio/midi",
      "audio/x-midi",
      "audio/mpeg",
      "video/mp4",
      "video/mpeg",
      "application/vnd.apple.installer+xml",
      "application/vnd.oasis.opendocument.presentation",
      "application/vnd.oasis.opendocument.spreadsheet",
      "application/vnd.oasis.opendocument.text",
      "audio/ogg",
      "video/ogg",
      "application/ogg",
      "audio/opus",
      "font/otf",
      "image/png",
      "application/pdf",
      "application/x-httpd-php",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.rar",
      "application/rtf",
      "application/x-sh",
      "image/svg+xml",
      "application/x-shockwave-flash",
      "application/x-tar",
      "image/tiff",
      "video/mp2t",
      "font/ttf",
      "application/vnd.visio",
      "audio/wav",
      "audio/webm",
      "video/webm",
      "image/webp",
      "font/woff",
      "font/woff2",
      "application/xhtml+xml",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/xml",
      "application/atom+xml",
      "application/vnd.mozilla.xul+xml",
      "application/zip",
      "video/3gpp",
      "audio/3gpp",
      "video/3gpp2",
      "audio/3gpp2",
      "application/x-7z-compressed"
    ];
  },

  propertiesEditableInModal() {
    return ["examples", "enum", "default", "const"];
  },

  getContentEncoding() {
    return [
      "",
      "base64",
      "base32",
      "base16",
      "quoted-printable",
      "binary",
      "8bit",
      "7bit"
    ];
  },

  getJsonStringFormat() {
    return [
      "",
      "date-time",
      "time",
      "date",
      "duration",
      "email",
      "idn-email",
      "hostname",
      "idn-hostname",
      "ipv4",
      "ipv6",
      "uuid",
      "uri",
      "uri-reference",
      "uri-template",
      "iri",
      "iri-reference",
      "json-pointer",
      "relative-json-pointer",
      "regex"
    ];
  },

  stringSpec() {
    return {
      minLength: undefined,
      maxLength: undefined,
      pattern: undefined,
      format: undefined,
      contentEncoding: undefined,
      contentMediaType: undefined
    };
  },

  numericSpec() {
    return {
      multipleOf: undefined,
      minimum: undefined,
      maximum: undefined,
      exclusiveMinimum: undefined,
      exclusiveMaximum: undefined
    };
  },

  objectSpec() {
    return {
      minProperties: undefined,
      maxProperties: undefined
    };
  },

  arraySpec() {
    return {
      minContains: undefined,
      maxContains: undefined,
      minItems: undefined,
      maxItems: undefined
    };
  },

  dataSpec() {
    return {
      enum: undefined,
      default: undefined,
      const: undefined,
      readOnly: undefined,
      writeOnly: undefined
    };
  },

  genericSpec() {
    return {
      id: undefined,
      title: undefined,
      examples: undefined,
      deprecated: undefined
    };
  },

  getSpecGroup(keyName) {
    switch (keyName) {
      case "minLength":
      case "maxLength":
      case "pattern":
      case "format":
      case "contentEncoding":
      case "contentMediaType":
        return "string";
      case "multipleOf":
      case "minimum":
      case "maximum":
      case "exclusiveMinimum":
      case "exclusiveMaximum":
        return "numeric";
      case "minProperties":
      case "maxProperties":
        return "object";
      case "minContains":
      case "maxContains":
      case "minItems":
      case "maxItems":
        return "array";
      case "deprecated":
      case "examples":
      case "id":
      case "title":
        return "generic";

      case "default":
      case "readOnly":
      case "writeOnly":
      case "enum":
      case "const":
        return "data";
      default:
        return "other";
    }
  },

  getSpecificationState(type) {
    const stringSpec = this.stringSpec();
    const numericSpec = this.numericSpec();
    const objectSpec = this.objectSpec();
    const arraySpec = this.arraySpec();
    const dataSpec = this.dataSpec();
    const genericSpec = this.genericSpec();

    switch (type) {
      case "string":
        return { ...stringSpec, ...dataSpec, ...genericSpec };
      case "boolean":
        return { ...dataSpec, ...genericSpec };
      case "number":
      case "integer":
        return { ...numericSpec, ...dataSpec, ...genericSpec };
      case "object":
      case "keyObject":
        return { ...objectSpec, ...dataSpec, ...genericSpec };
      case "array":
        return { ...arraySpec, ...dataSpec, ...genericSpec };
      case "multi":
      case "any":
        return {
          ...stringSpec,
          ...numericSpec,
          ...objectSpec,
          ...arraySpec,
          ...dataSpec,
          ...genericSpec
        };
      default:
        return {};
    }
  },

  getColumnById(allTables, urlId, urlCid) {
    return _.find(allTables[urlId].cols, ["id", urlCid]);
  },

  extractFromSpecification(specification, keyName, strictJsonFormat) {
    if (specification !== undefined && specification.trim() !== "") {
      try {
        const parsedSpecification = Helpers.parseJson(specification);

        return Object.keys(parsedSpecification).reduce((accumulator, key) => {
          if (key === keyName) {
            accumulator[key] = parsedSpecification[key];
          }
          return accumulator;
        }, {});
      } catch (e) {
        return specification;
      }
    }
  },

  prepareListForDeletion(table, list, allTables) {
    let listToReturn = [];
    _.map(table.cols, (col) => {
      if (
        allTables[col.datatype] &&
        this.isDefOrRef(allTables[col.datatype]) === false
      ) {
        let childItemsArray = this.prepareListForDeletion(
          allTables[col.datatype],
          list,
          allTables
        );
        listToReturn = [...listToReturn, col.datatype, ...childItemsArray];
      }
    });
    return _.uniq([...list, ...listToReturn]);
  },

  getSpecificationParsedState(specification, type) {
    var parsedSpecification;
    var parsedSpecificationWithoutDescription = {};

    const initState = this.getSpecificationState(type);
    if (specification !== undefined && specification.trim() !== "") {
      parsedSpecification = json5.parse(specification);

      parsedSpecificationWithoutDescription = Object.keys(
        parsedSpecification
      ).reduce((accumulator, key) => {
        if (key !== "description" && key !== "name") {
          accumulator[key] = parsedSpecification[key];
        }
        return accumulator;
      }, {});
    }

    return {
      specification: { ...initState, ...parsedSpecificationWithoutDescription }
    };
  },

  getRootSchemaTable(tables) {
    return _.find(tables, ["embeddable", false]);
  }
};
export default JsonSchemaHelpers;
