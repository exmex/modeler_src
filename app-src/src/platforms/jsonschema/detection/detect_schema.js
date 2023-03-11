import Helpers from "../../../helpers/helpers";
import JsonSchemaHelpers from "../helpers_jsonschema";
import { TableControlTypesJson } from "../class_table_jsonschema";
import _ from "lodash";
import { getRefSchema } from "./ref_detection";

export const getRootOrDefSchema = (
  globalSchema,
  rootOrDef,
  { definitionKeyName }
) => {
  return rootOrDef?.nodeType === TableControlTypesJson.ROOT
    ? globalSchema
    : rootOrDef?.nodeType === TableControlTypesJson.SUBSCHEMA
    ? globalSchema?.properties[definitionKeyName]
    : undefined;
};
export const extractSchemasForPath = (
  { root, path },
  { globalSchema, jsonCodeSettings, type }
) => {
  const definitionKeyName = JsonSchemaHelpers.getDefinitionKeyName(root, {
    jsonCodeSettings,
    type
  });

  const schemaForBaseObject = getRootOrDefSchema(globalSchema, root, {
    definitionKeyName
  });

  return syncSchemasAndPath("#", path, {
    globalSchema,
    schemaForBaseObject
  });
};

export const evalRefBySchema = (globalSchema, property) => {
  if (!!property?.$ref) {
    const evaluatedRef = getRefSchema(globalSchema, property);
    if (evaluatedRef) {
      return evaluatedRef;
    }
  }
  return undefined;
};

const followPatternProperties = (
  name,
  path,
  { schemaForBaseObject, globalSchema }
) => {
  const patternProperties = schemaForBaseObject.patternProperties;
  const firstPathItem = [...path].splice(0, 1)[0];
  const propertyName = firstPathItem.col.name;

  const schemas = _.reduce(
    _.filter(
      _.keys(patternProperties),
      (key) => !!propertyName?.match(new RegExp(key))
    ),
    (patternPropertiesSchemas, keyname) => [
      ...patternPropertiesSchemas,
      ...syncSchemasAndPath([name, keyname].join("/"), [...path].splice(1), {
        globalSchema,
        schemaForBaseObject: patternProperties?.[keyname]
      })
    ],
    []
  );

  return schemas;
};

const followProperty = (name, path, { schemaForBaseObject, globalSchema }) => {
  const properties = schemaForBaseObject.properties;
  const firstPathItem = [...path].splice(0, 1)[0];
  const propertyName = firstPathItem.col.name;
  const property = properties?.[propertyName];
  if (property) {
    return syncSchemasAndPath(
      [name, propertyName].join("/"),
      [...path].splice(1),
      {
        globalSchema,
        schemaForBaseObject: property
      }
    );
  }
  return [];
};

const syncConditionals = (
  result,
  { name, path, schemaForBaseObject, globalSchema }
) => {
  const thenKey = schemaForBaseObject?.then;
  const elseKey = schemaForBaseObject?.else;
  const oneOfKey = schemaForBaseObject?.oneOf;
  const anyOfKey = schemaForBaseObject?.anyOf;
  const allOfKey = schemaForBaseObject?.allOf;
  if (oneOfKey || anyOfKey || allOfKey || thenKey || elseKey) {
    const schemas = _.reduce(
      [
        ...(oneOfKey ?? []),
        ...(anyOfKey ?? []),
        ...(allOfKey ?? []),
        ...(thenKey ? [thenKey] : []),
        ...(elseKey ? [elseKey] : [])
      ],
      (r, conditionalSchemas) => [
        ...r,
        ...syncSchemasAndPath(name, path, {
          globalSchema,
          schemaForBaseObject: conditionalSchemas
        })
      ],
      []
    );
    result = [...result, ...schemas];
  }
  return result;
};

const syncObject = (
  result,
  { name, path, schemaForBaseObject, globalSchema }
) => {
  const propertySchemas = followProperty(name, path, {
    globalSchema,
    schemaForBaseObject
  });
  if (propertySchemas.length > 0) {
    result = [...result, ...propertySchemas];
  } else {
    const patternPropertiesSchemas = followPatternProperties(name, path, {
      globalSchema,
      schemaForBaseObject
    });
    if (patternPropertiesSchemas.length > 0) {
      result = [...result, ...patternPropertiesSchemas];
    } else {
      const additionalPropertiesSchemas = followAdditionalProperties(
        name,
        path,
        { globalSchema, schemaForBaseObject }
      );
      if (additionalPropertiesSchemas.length > 0) {
        result = [...result, ...additionalPropertiesSchemas];
      }
    }
  }
  return result;
};

const syncArray = (
  result,
  { name, path, schemaForBaseObject, globalSchema }
) => {
  if (schemaForBaseObject.items) {
    const items = schemaForBaseObject.items;
    if (items) {
      result = [
        ...result,
        ...syncSchemasAndPath([name, "[]"].join("/"), [...path].splice(1), {
          globalSchema,
          schemaForBaseObject: items
        })
      ];
    }
  }
  if (schemaForBaseObject.additionalItems) {
    const additionalItems = schemaForBaseObject.additionalItems;
    if (additionalItems) {
      result = [
        ...result,
        ...syncSchemasAndPath([name, "[]"].join("/"), [...path].splice(1), {
          globalSchema,
          schemaForBaseObject: additionalItems
        })
      ];
    }
  }
  return result;
};

const syncSchemasAndPath = (
  name,
  path,
  { globalSchema, schemaForBaseObject }
) => {
  let result = [];
  if (
    schemaForBaseObject === true ||
    (_.isObject(schemaForBaseObject) && _.isEmpty(schemaForBaseObject))
  ) {
    result.push({ name, schema: true });
  }
  const ref = schemaForBaseObject?.$ref;
  if (ref) {
    const refSchema = evalRefBySchema(globalSchema, schemaForBaseObject);
    const schemasAndPath = syncSchemasAndPath(ref, path, {
      globalSchema,
      schemaForBaseObject: refSchema
    });

    result = [...result, ...(schemasAndPath ? schemasAndPath : [])];
  }
  const propertiesKey = schemaForBaseObject?.properties;
  const patternPropertiesKey = schemaForBaseObject?.patternProperties;
  const additionalPropertiesKey = schemaForBaseObject?.additionalProperties;
  const itemsKey = schemaForBaseObject?.items;
  const additionalItemsKey = schemaForBaseObject?.additionalItems;
  const isArrayType = schemaForBaseObject?.type === "array";
  result = syncConditionals(result, {
    name,
    path,
    schemaForBaseObject,
    globalSchema
  });
  if (
    path.length > 0 &&
    (propertiesKey ||
      patternPropertiesKey ||
      additionalPropertiesKey ||
      itemsKey ||
      additionalItemsKey)
  ) {
    if (!isArrayType) {
      result = syncObject(result, {
        name,
        path,
        schemaForBaseObject,
        globalSchema
      });
    } else {
      result = syncArray(result, {
        name,
        path,
        schemaForBaseObject,
        globalSchema
      });
    }
    return result;
  } else if (
    path.length === 0 &&
    (propertiesKey ||
      patternPropertiesKey ||
      additionalPropertiesKey ||
      itemsKey ||
      additionalItemsKey)
  ) {
    result.push({ name, schema: schemaForBaseObject });
  }
  return result;
};

const followAdditionalProperties = (
  name,
  path,
  { globalSchema, schemaForBaseObject }
) => {
  const additionalProperties = schemaForBaseObject.additionalProperties;
  const firstPathItem = [...path].splice(0, 1)[0];
  const propertyName = firstPathItem.col.name;
  if (additionalProperties) {
    return syncSchemasAndPath(
      [name, propertyName].join("/"),
      [...path].splice(1),
      {
        globalSchema,
        schemaForBaseObject: additionalProperties
      }
    );
  }
  return [];
};

export const getSpecification = (tables, tableId, colId) => {
  try {
    const col = JsonSchemaHelpers.getColumnById(tables, tableId, colId);
    const table = tables[tableId];
    if (col) {
      return Helpers.parseJson(col.specification);
    }
    return Helpers.parseJson(table.specification);
  } catch {
    return {};
  }
};
