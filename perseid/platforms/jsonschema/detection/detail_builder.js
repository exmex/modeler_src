import {
  evalRefBySchema,
  extractSchemasForPath,
  getSpecification
} from "./detect_schema";

import JsonSchemaHelpers from "../helpers_jsonschema";
import { TableObjectTypesJson } from "../class_table_jsonschema";
import _ from "lodash";
import { getActiveSchema } from "./schema_detection";
import { getPath } from "./path_detection";

const isAtomic = ({ key, globalSchema, propertySchema, value }) => {
  if (key === "example" || key === "examples") {
    return true;
  }
  if (
    propertySchema === true ||
    propertySchema?.additionalProperties === true ||
    propertySchema?.additionalItems === true
  ) {
    return true;
  }
  if (_.isEmpty(propertySchema) && _.isObject(propertySchema)) {
    return true;
  }
  if (
    typeof value === "string" ||
    typeof value === "boolean" ||
    typeof value === "number" ||
    (_.isArray(value) &&
      (_.every(value, _.isNumber) ||
        _.every(value, _.isString) ||
        _.every(value, _.isBoolean)))
  ) {
    return true;
  }
  if (_.isArray(propertySchema?.enum)) {
    return true;
  }
  if (
    ["string", "number", "boolean", "null", "enum"].includes(
      propertySchema?.type
    )
  ) {
    return true;
  }
  if (propertySchema?.$ref) {
    const refSchema = evalRefBySchema(globalSchema, propertySchema);
    return isAtomic({ key, globalSchema, propertySchema: refSchema, value });
  }
  if (propertySchema?.type === "array") {
    const itemsSchema = propertySchema.items;
    return isAtomic({ key, globalSchema, propertySchema: itemsSchema, value });
  }
  const thenKey = propertySchema?.then;
  const elseKey = propertySchema?.else;
  const oneOfKey = propertySchema?.oneOf;
  const anyOfKey = propertySchema?.anyOf;
  const allOfKey = propertySchema?.allOf;
  if (oneOfKey || anyOfKey || allOfKey || thenKey || elseKey) {
    return _.reduce(
      [
        ...(oneOfKey ?? []),
        ...(anyOfKey ?? []),
        ...(allOfKey ?? []),
        ...(thenKey ? [thenKey] : []),
        ...(elseKey ? [elseKey] : [])
      ],
      (r, v) => r || isAtomic({ key, globalSchema, value, propertySchema: v }),
      false
    );
  }

  return false;
};

const isComplex = ({ key, globalSchema, propertySchema, value }) => {
  if (key === "example" || key === "examples") {
    return false;
  }
  if (propertySchema?.$dynamicRef === "#meta") {
    return true;
  }
  if (_.isEmpty(propertySchema) && _.isObject(propertySchema)) {
    return true;
  }
  if (
    propertySchema === true ||
    propertySchema?.additionalProperites === true ||
    propertySchema?.additionalItems === true
  ) {
    return true;
  }
  if (
    typeof value === "object" ||
    (_.isArray(value) && _.every(value, _.isObject))
  ) {
    return true;
  }
  if (["object"].includes(propertySchema?.type)) {
    return true;
  }
  if (propertySchema?.$ref) {
    const refSchema = evalRefBySchema(globalSchema, propertySchema);
    return isComplex({ key, globalSchema, propertySchema: refSchema, value });
  }
  if (propertySchema?.type === "array") {
    const itemsSchema = propertySchema.items;
    return isComplex({ key, globalSchema, propertySchema: itemsSchema, value });
  }
  const thenKey = propertySchema?.then;
  const elseKey = propertySchema?.else;
  const oneOfKey = propertySchema?.oneOf;
  const anyOfKey = propertySchema?.anyOf;
  const allOfKey = propertySchema?.allOf;
  if (oneOfKey || anyOfKey || allOfKey || thenKey || elseKey) {
    return _.reduce(
      [
        ...(oneOfKey ?? []),
        ...(anyOfKey ?? []),
        ...(allOfKey ?? []),
        ...(thenKey ? [thenKey] : []),
        ...(elseKey ? [elseKey] : [])
      ],
      (r, v) => r || isComplex({ key, globalSchema, value, propertySchema: v }),
      false
    );
  }
  return false;
};

const isInDefaultUI = (propertyName) => {
  return ["description", "openapi", "swagger"].includes(propertyName);
};

const getAtomicProperties = ({
  globalSchema,
  schemaProperties,
  specification
}) => {
  const atomicPropertyKeys = _.filter(
    _.keys(schemaProperties),
    (key) =>
      !isInDefaultUI(key) &&
      !!isAtomic({
        key,
        globalSchema,
        propertySchema: schemaProperties[key],
        value: specification?.[key]
      })
  );
  return _.map(atomicPropertyKeys, (key) => ({
    name: key,
    definition: schemaProperties[key],
    value: specification?.[key]
  }));
};

const existsKeyInCols = (key, cols) => {
  return !!_.find(cols, (col) => col.name === key);
};

const getComplexProperties = ({
  globalSchema,
  schemaProperties,
  specification,
  cols
}) => {
  const complexPropertyKeys = _.filter(
    _.keys(schemaProperties),
    (key) =>
      !existsKeyInCols(key, cols) &&
      !isInDefaultUI(key) &&
      !!isComplex({
        key,
        globalSchema,
        propertySchema: schemaProperties[key],
        value: specification?.[key]
      })
  );
  return _.reduce(
    complexPropertyKeys,
    (r, key) => {
      const propertyTypes = getPropertyType({
        schemaContext: schemaProperties[key],
        globalSchema
      });
      return [
        ...r,
        ..._.map(propertyTypes, (propertyType) => ({
          name: key,
          definition: schemaProperties[key],
          value: specification?.[key],
          type: propertyType
        }))
      ];
    },
    []
  );
};

const getComplexItems = ({ globalSchema, schema }) => {
  if (schema?.items && schema?.type === "array") {
    const propertyTypes = getPropertyType({
      schemaContext: schema?.items,
      globalSchema
    });
    return _.map(propertyTypes, (propertyType) => ({
      definition: schema?.items,
      type: propertyType
    }));
  }
  return undefined;
};

const isSchema = (item) => {
  return (
    item.$ref === "$defs/schema" ||
    item.$ref === "#/$defs/schema" ||
    item.$ref === "#/definitions/schema" ||
    item.$ref === "#/definitions/Schema"
  );
};

const getPropertyType = ({ globalSchema, schemaContext }) => {
  let targetSchemaContext = schemaContext;
  if (schemaContext?.$ref) {
    targetSchemaContext =
      evalRefBySchema(globalSchema, schemaContext) ?? schemaContext;
  }
  if (
    schemaContext?.$ref === "$defs/schema" ||
    schemaContext?.$ref === "definitions/schema" ||
    schemaContext?.$ref === "definitions/Schema" ||
    schemaContext?.$ref === "#/$defs/schema" ||
    schemaContext?.$ref === "#/definitions/schema" ||
    schemaContext?.$ref === "#/definitions/Schema"
  ) {
    return [TableObjectTypesJson.ANY];
  }
  if (schemaContext?.$dynamicRef === "#meta") {
    return [TableObjectTypesJson.ANY];
  }
  if (schemaContext?.oneOf) {
    if (!!_.find(schemaContext?.oneOf, isSchema)) {
      return [TableObjectTypesJson.ANY];
    }
  }
  if (schemaContext?.anyOf) {
    if (!!_.find(schemaContext?.anyOf, isSchema)) {
      return [TableObjectTypesJson.ANY];
    }
  }
  if (schemaContext?.allOf) {
    if (!!_.find(schemaContext?.allOf, isSchema)) {
      return [TableObjectTypesJson.ANY];
    }
  }
  if (targetSchemaContext?.type === TableObjectTypesJson.ARRAY) {
    return [TableObjectTypesJson.KEYARRAY];
  }
  if (
    schemaContext === true ||
    (_.isObject(schemaContext) && _.isEmpty(schemaContext))
  ) {
    return [TableObjectTypesJson.KEYOBJECT, TableObjectTypesJson.KEYARRAY];
  }
  return [TableObjectTypesJson.KEYOBJECT];
};

const getAtomicPatternProperties = ({
  globalSchema,
  schemaPatternProperties,
  specification
}) => {
  return _.map(
    _.filter(
      _.keys(schemaPatternProperties),
      (patternPropertyKey) =>
        !!isAtomic({
          key: patternPropertyKey,
          globalSchema,
          propertySchema: schemaPatternProperties[patternPropertyKey],
          value: undefined
        })
    ),
    (atomicPatternPropertyKey) => ({
      patternPropertyKey: atomicPatternPropertyKey,
      patternPropertyKeySchema:
        schemaPatternProperties[atomicPatternPropertyKey],
      patternInstances: _.map(
        _.filter(
          _.keys(specification),
          (key) =>
            !!key.match(new RegExp(atomicPatternPropertyKey)) &&
            !!isAtomic({
              key,
              globalSchema,
              propertySchema: schemaPatternProperties[atomicPatternPropertyKey],
              value: specification?.[key]
            })
        ),
        (key) => ({
          name: key,
          definition: schemaPatternProperties[atomicPatternPropertyKey],
          value: specification?.[key]
        })
      )
    })
  );
};

const RESPONSES = [
  { name: "200", label: "200 (OK)" },
  { name: "201", label: "201 (Created)" },
  { name: "204", label: "204 (No Content)" },
  { name: "304", label: "304 (Not Modified)" },
  { name: "400", label: "400 (Bad Request)" },
  { name: "401", label: "401 (Unauthorized)" },
  { name: "403", label: "403 (Forbidden)" },
  { name: "404", label: "404 (Not Found)" },
  { name: "409", label: "409 (Conflict)" },
  { name: "410", label: "410 (Gone)" },
  { name: "500", label: "500 (Internal Server Error)" }
];

const PATTERN_KEY_CONVERSION = {
  "^x-": [{ name: "x-", label: "x- (vendorExtension)" }],
  "^/": [{ name: "/", label: "/ (path)" }],
  "^\\/": [{ name: "/", label: "/ (path)" }],
  "^([0-9]{3})$|^(default)$": [
    ...RESPONSES,
    { name: "default", label: "default" }
  ],
  "^[1-5](?:\\d{2}|XX)$": RESPONSES,
  "^[1-5](?:[0-9]{2}|XX)$": RESPONSES,
  "^(get|put|post|delete|options|head|patch|trace)$": [
    { name: "get", label: "get" },
    { name: "put", label: "put" },
    { name: "post", label: "post" },
    { name: "delete", label: "delete" },
    { name: "options", label: "options" },
    { name: "head", label: "head" },
    { name: "patch", label: "patch" },
    { name: "trace", label: "trace" }
  ],
  "^\\$ref$": [{ name: "$ref", label: "$ref" }],
  "^(schemas|responses|parameters|examples|requestBodies|headers|securitySchemes|links|callbacks|pathItems)$":
    [
      { name: "schemas", label: "schemas" },
      { name: "responses", label: "responses" },
      { name: "parameters", label: "parameters" },
      { name: "examples", label: "examples" },
      { name: "requestBodies", label: "requestBodies" },
      { name: "headers", label: "headers" },
      { name: "securitySchemes", label: "securitySchemes" },
      { name: "links", label: "links" },
      { name: "callbacks", label: "callbacks" },
      { name: "pathItems", label: "pathItems" }
    ],
  "^[a-zA-Z0-9\\.\\-_]+$": [{ name: "", label: "Schema" }]
};

const generagePatternKeysWithInstances = (complexPatternPropertyKeys) => {
  return _.reduce(
    complexPatternPropertyKeys,
    (result, key) => {
      const mapping = PATTERN_KEY_CONVERSION[key];
      if (mapping) {
        return [...result, ..._.map(mapping, (map) => ({ ...map, key }))];
      }
      return [...result, { name: key, label: key, key }];
    },
    []
  );
};

export const generageDefaultRegExp = (regExp) => {
  const mapping = _.first(PATTERN_KEY_CONVERSION[regExp]);
  return mapping?.name ?? regExp;
};

const getComplexPatternProperties = ({
  globalSchema,
  schemaPatternProperties,
  specification,
  cols
}) => {
  const complexPatternPropertyKeys = _.filter(
    _.keys(schemaPatternProperties),
    (key) =>
      !!isComplex({
        key: schemaPatternProperties,
        globalSchema,
        propertySchema: schemaPatternProperties[key],
        value: specification?.[key]
      })
  );
  const patternKeysWithInstances = generagePatternKeysWithInstances(
    complexPatternPropertyKeys
  );
  return _.reduce(
    _.filter(
      patternKeysWithInstances,
      ({ name }) => !existsKeyInCols(name, cols)
    ),
    (r, { key, label, name }) => {
      const propertyTypes = getPropertyType({
        schemaContext: schemaPatternProperties[key],
        globalSchema
      });
      return [
        ...r,
        ..._.map(propertyTypes, (propertyType) => ({
          name,
          label:
            propertyType === TableObjectTypesJson.KEYARRAY
              ? `${label} (array)`
              : label,
          definition: complexPatternPropertyKeys[key],
          type: propertyType
        }))
      ];
    },
    []
  );
};

const getComplexAdditionalProperties = ({ schemasForPath, globalSchema }) => {
  const complexAdditionalProperties = _.filter(
    schemasForPath,
    (schemaForPath) => {
      return !!isComplex({
        key: undefined,
        globalSchema,
        propertySchema: schemaForPath.schema?.additionalProperties,
        value: undefined
      });
    }
  );
  return {
    count: complexAdditionalProperties.length > 0,
    type: _.reduce(
      complexAdditionalProperties,
      (result, schemaForPath) => {
        const propertyTypes = getPropertyType({
          globalSchema,
          schemaContext: schemaForPath.schema?.additionalProperties
        });
        const currentPropertyType = _.find(
          propertyTypes,
          (propertyType) => propertyType !== TableObjectTypesJson.KEYOBJECT
        );
        if (currentPropertyType) {
          return currentPropertyType;
        }
        return result;
      },
      TableObjectTypesJson.KEYOBJECT
    )
  };
};

const getAtomicAdditionalProperties = ({
  globalSchema,
  schemasForPath,
  specification
}) => {
  const atomicAdditionalPropertyKeys = _.filter(
    _.keys(specification),
    (key) => {
      return (
        !_.find(
          schemasForPath,
          (schemaForPath) => schemaForPath.schema?.properties?.[key]
        ) &&
        !_.find(
          schemasForPath,
          (schemaForPath) =>
            !!_.find(
              _.keys(schemaForPath.schema?.patternProperties),
              (patternPropertyKey) =>
                !!key.match(new RegExp(patternPropertyKey))
            )
        ) &&
        !!isAtomic({
          key,
          globalSchema,
          propertySchema: true,
          value: specification?.[key]
        })
      );
    }
  );
  return _.map(atomicAdditionalPropertyKeys, (key) => ({
    name: key,
    definition: true,
    value: specification?.[key]
  }));
};

const extendSchemas = ({
  schemasForPath,
  globalSchema,
  specification,
  cols
}) => {
  return _.map(schemasForPath, (schemaForPath) => {
    const extendedSchema = Object.assign({}, schemaForPath);

    extendedSchema.atomicProperties = getAtomicProperties({
      globalSchema,
      schemaProperties: extendedSchema?.schema?.properties,
      specification
    });
    extendedSchema.atomicPatternProperties = getAtomicPatternProperties({
      globalSchema,
      schemaPatternProperties: extendedSchema?.schema?.patternProperties,
      specification
    });

    extendedSchema.complexProperties = getComplexProperties({
      globalSchema,
      schemaProperties: extendedSchema?.schema?.properties,
      specification,
      cols
    });

    extendedSchema.complexPatternProperties = getComplexPatternProperties({
      globalSchema,
      schemaPatternProperties: extendedSchema?.schema?.patternProperties,
      specification,
      cols
    });

    extendedSchema.complexItems = getComplexItems({
      globalSchema,
      schema: extendedSchema?.schema
    });

    return extendedSchema;
  });
};

const buildDetailForEmptyRoot = ({
  globalSchema,
  schemasForPath,
  specification
}) => {
  const extendedSchema = Object.assign({}, undefined);
  extendedSchema.name = "";
  const atomicAdditionalProperties = getAtomicAdditionalProperties({
    globalSchema,
    schemasForPath,
    specification
  });
  const complexAdditionalProperties = getComplexAdditionalProperties({
    globalSchema,
    schemasForPath
  });
  return {
    schemasForPath: [extendedSchema],
    atomicAdditionalProperties,
    complexAdditionalProperties,
    hasJSONSchema: true
  };
};

const merge = (item1, item2) => {
  _.forEach(item2.atomicProperties, (p2) => {
    if (!_.find(item1.atomicProperties, (p1) => p1.name === p2.name)) {
      item1.atomicProperties.push(p2);
    }
  });
};

const removeDuplicateAtomicProperites = (schemasForPath) => {
  const removedDulicateAtomicProperties = _.reduce(
    schemasForPath.schemasForPath,
    (r, schemaForPath) => {
      const existing = _.find(r, (i) => i.name === schemaForPath.name);
      if (!!existing) {
        merge(existing, schemaForPath);
        return r;
      }
      return [...r, schemaForPath];
    },
    []
  );
  return {
    ...schemasForPath,
    schemasForPath: removedDulicateAtomicProperties
  };
};

export const buildDetail = ({
  schemasForPath,
  specification,
  cols,
  globalSchema
}) => {
  if (schemasForPath.length === 0) {
    return removeDuplicateAtomicProperites(
      buildDetailForEmptyRoot({
        globalSchema,
        schemasForPath,
        specification
      })
    );
  }

  const extendedSchemas = extendSchemas({
    schemasForPath,
    globalSchema,
    specification,
    cols
  });

  const atomicAdditionalProperties = getAtomicAdditionalProperties({
    globalSchema,
    schemasForPath,
    specification
  });

  const complexAdditionalProperties = getComplexAdditionalProperties({
    globalSchema,
    schemasForPath
  });

  return removeDuplicateAtomicProperites({
    schemasForPath: extendedSchemas,
    atomicAdditionalProperties,
    complexAdditionalProperties,
    hasJSONSchema: schemasForPath.length === 0 || hasJSONSchema(schemasForPath)
  });
};

const hasJSONSchema = (schemasForPath) => {
  return _.reduce(
    schemasForPath,
    (result, schemaForPath) => {
      return (
        result ||
        schemaForPath.name === "#/definitions/schema" ||
        schemaForPath.name === "#/definitions/Schema"
      );
    },
    false
  );
};

export const getGlobalSchema = ({ tables, type }) => {
  const root = JsonSchemaHelpers.getRootSchemaTable(tables);
  return getActiveSchema({ root, type: type });
};

export const buildDetailFromParameters = ({
  tableId,
  columnId,
  tables,
  catalogColumns,
  jsonCodeSettings,
  type
}) => {
  const globalSchema = getGlobalSchema({ tables, type });

  const { root, path } = getPath(
    tables,
    catalogColumns.tableToCol,
    tableId,
    columnId
  );

  const schemasForPath = extractSchemasForPath(
    { root, path },
    {
      globalSchema: globalSchema,
      jsonCodeSettings: jsonCodeSettings,
      type: type
    }
  );

  const specification = getSpecification(tables, tableId, columnId);
  const cols = columnId
    ? JsonSchemaHelpers.getDatatypeTableByDatatypeColId(
        tables,
        catalogColumns.colToTable,
        columnId
      )?.cols
    : tables[tableId].cols;
  return buildDetail({
    schemasForPath,
    specification,
    cols,
    globalSchema
  });
};
