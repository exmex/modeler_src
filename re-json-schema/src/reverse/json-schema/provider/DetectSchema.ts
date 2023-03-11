import _ from "lodash";
import { getRefSchema } from "./RefDetection";

export const extractSchemasForPath = (
  { root, path }: { root: any; path: string[] },
  { globalSchema, type }: { globalSchema: any; type: string }
) => {
  return syncSchemasAndPath("#", path, {
    globalSchema,
    schemaForBaseObject: globalSchema,
    isJSONSchema: false
  });
};

export const evalRefBySchema = (globalSchema: any, property: any) => {
  if (!!property?.$ref) {
    const evaluatedRef = getRefSchema(globalSchema, property);
    if (evaluatedRef) {
      return evaluatedRef;
    }
  }
  return undefined;
};

const followPatternProperties = (
  name: string,
  path: string[],
  {
    schemaForBaseObject,
    globalSchema,
    isJSONSchema
  }: { schemaForBaseObject: any; globalSchema: any; isJSONSchema: boolean }
) => {
  const patternProperties = schemaForBaseObject.patternProperties;
  const firstPathItem = [...path].splice(0, 1)[0];
  const propertyName = firstPathItem;

  const schemas = _.reduce(
    _.filter(
      _.keys(patternProperties),
      (key) => !!propertyName?.match(new RegExp(key))
    ),
    (patternPropertiesSchemas, keyname) => [
      ...patternPropertiesSchemas,
      ...syncSchemasAndPath([name, keyname].join("/"), [...path].splice(1), {
        globalSchema,
        schemaForBaseObject: patternProperties?.[keyname],
        isJSONSchema
      })
    ],
    []
  );

  return schemas;
};

const followProperty = (
  name: string,
  path: string[],
  {
    schemaForBaseObject,
    globalSchema,
    isJSONSchema
  }: { schemaForBaseObject: any; globalSchema: any; isJSONSchema: boolean }
) => {
  const properties = schemaForBaseObject.properties;
  const firstPathItem = [...path].splice(0, 1)[0];
  const propertyName = firstPathItem;
  const property = properties?.[propertyName];
  if (property) {
    return syncSchemasAndPath(
      [name, propertyName].join("/"),
      [...path].splice(1),
      {
        globalSchema,
        schemaForBaseObject: property,
        isJSONSchema
      }
    );
  }
  return [];
};

const syncConditionals = (
  result: any,
  {
    name,
    path,
    schemaForBaseObject,
    globalSchema,
    isJSONSchema
  }: {
    name: string;
    path: string[];
    schemaForBaseObject: any;
    globalSchema: any;
    isJSONSchema: boolean;
  }
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
          schemaForBaseObject: conditionalSchemas,
          isJSONSchema
        })
      ],
      []
    );
    result = [...result, ...schemas];
  }
  return result;
};

const syncObject = (
  result: any,
  {
    name,
    path,
    schemaForBaseObject,
    globalSchema,
    isJSONSchema
  }: {
    name: string;
    path: string[];
    schemaForBaseObject: any;
    globalSchema: any;
    isJSONSchema: boolean;
  }
) => {
  const propertySchemas = followProperty(name, path, {
    globalSchema,
    schemaForBaseObject,
    isJSONSchema
  });
  if (propertySchemas.length > 0) {
    result = [...result, ...propertySchemas];
  } else {
    const patternPropertiesSchemas = followPatternProperties(name, path, {
      globalSchema,
      schemaForBaseObject,
      isJSONSchema
    });
    if (patternPropertiesSchemas.length > 0) {
      result = [...result, ...patternPropertiesSchemas];
    } else {
      const additionalPropertiesSchemas = followAdditionalProperties(
        name,
        path,
        { globalSchema, schemaForBaseObject, isJSONSchema }
      );
      if (additionalPropertiesSchemas.length > 0) {
        result = [...result, ...additionalPropertiesSchemas];
      }
    }
  }
  return result;
};

const syncArray = (
  result: any,
  {
    name,
    path,
    schemaForBaseObject,
    globalSchema,
    isJSONSchema
  }: {
    name: string;
    path: string[];
    schemaForBaseObject: any;
    globalSchema: any;
    isJSONSchema: boolean;
  }
) => {
  if (schemaForBaseObject.items) {
    const items = schemaForBaseObject.items;
    if (items) {
      result = [
        ...result,
        ...syncSchemasAndPath([name, "[]"].join("/"), [...path].splice(1), {
          globalSchema,
          schemaForBaseObject: items,
          isJSONSchema
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
          schemaForBaseObject: additionalItems,
          isJSONSchema
        })
      ];
    }
  }
  return result;
};

const evalJSONSchema = (ref: string): boolean => {
  return (
    ref === "$defs/schema" ||
    ref === "#/definitions/schema" ||
    ref === "#/definitions/Schema"
  );
};

const syncSchemasAndPath = (
  name: string,
  path: string[],
  {
    globalSchema,
    schemaForBaseObject,
    isJSONSchema
  }: { globalSchema: any; schemaForBaseObject: any; isJSONSchema: boolean }
): any => {
  let result: any[] = [];
  const ref = schemaForBaseObject?.$ref;
  if (ref) {
    const isInnerJSONSchema = evalJSONSchema(ref) || isJSONSchema;
    if (isInnerJSONSchema) {
      result.push({
        name,
        schema: schemaForBaseObject,
        isJSONSchema: isInnerJSONSchema
      });
      return result;
    }
    const refSchema = evalRefBySchema(globalSchema, schemaForBaseObject);
    const schemasAndPath = syncSchemasAndPath(ref, path, {
      globalSchema,
      schemaForBaseObject: refSchema,
      isJSONSchema: isInnerJSONSchema
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
    globalSchema,
    isJSONSchema
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
        globalSchema,
        isJSONSchema
      });
    } else {
      result = syncArray(result, {
        name,
        path,
        schemaForBaseObject,
        globalSchema,
        isJSONSchema
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
    result.push({ name, schema: schemaForBaseObject, isJSONSchema });
  }
  return result;
};

const followAdditionalProperties = (
  name: string,
  path: string[],
  {
    globalSchema,
    schemaForBaseObject,
    isJSONSchema
  }: { globalSchema: any; schemaForBaseObject: any; isJSONSchema: boolean }
) => {
  const additionalProperties = schemaForBaseObject.additionalProperties;
  const firstPathItem = [...path].splice(0, 1)[0];
  const propertyName = firstPathItem;
  if (additionalProperties) {
    return syncSchemasAndPath(
      [name, propertyName].join("/"),
      [...path].splice(1),
      {
        globalSchema,
        schemaForBaseObject: additionalProperties,
        isJSONSchema
      }
    );
  }
  return [];
};
