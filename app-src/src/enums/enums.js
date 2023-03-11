export const ModelTypes = {
  GRAPHQL: "GRAPHQL",
  JSON: "JSON",
  MARIADB: "MARIADB",
  MONGODB: "MONGODB",
  MONGOOSE: "MONGOOSE",
  MSSQL: "MSSQL",
  MYSQL: "MYSQL",
  PG: "PG",
  SEQUELIZE: "SEQUELIZE",
  SQLITE: "SQLITE",
  LOGICAL: "LOGICAL",
  JSONSCHEMA: "JSONSCHEMA",
  OPENAPI: "OPENAPI",
  FULLJSON: "FULLJSON"
};

export const getPlatformProperty = (modelType) => {
  switch (modelType) {
    case ModelTypes.GRAPHQL:
      return "graphql";
    case ModelTypes.JSON:
      return "json";
    case ModelTypes.MARIADB:
      return "mariadb";
    case ModelTypes.MONGODB:
      return "mongodb";
    case ModelTypes.MONGOOSE:
      return "mongoose";
    case ModelTypes.MSSQL:
      return "mssql";
    case ModelTypes.MYSQL:
      return "mysql";
    case ModelTypes.PG:
      return "pg";
    case ModelTypes.SEQUELIZE:
      return "sequelize";
    case ModelTypes.SQLITE:
      return "sqlite";
    case ModelTypes.LOGICAL:
      return "logical";
    case ModelTypes.JSONSCHEMA:
      return "jsonschema";
    case ModelTypes.OPENAPI:
      return "openapi";
    case ModelTypes.FULLJSON:
      return "fulljson";
    default:
      return undefined;
  }
};

export const ModelTypesForHumans = {
  GRAPHQL: "GraphQL",
  JSON: "JSON",
  MARIADB: "MariaDB",
  MONGODB: "MongoDB",
  MONGOOSE: "Mongoose",
  MYSQL: "MySQL",
  MSSQL: "SQL Server",
  PG: "PostgreSQL",
  SEQUELIZE: "Sequelize",
  SQLITE: "SQLite",
  LOGICAL: "Logical",
  JSONSCHEMA: "JSON Schema",
  OPENAPI: "Open API",
  FULLJSON: "JSON"
};

export const RelationTypes = {
  IDENTIFYING: "Identifying",
  SINGLEFIELD: "Singlefield"
};

export const ObjectType = {
  MODEL: "model",
  TABLE: "table",
  NOTE: "note",
  OTHER_OBJECT: "other_object",
  RELATION: "relation",
  LINE: "line",
  INDEX: "index",
  KEY: "key",
  COLUMN: "column",
  DIAGRAM: "diagram"
};

export const ModelObjectProperties = {
  MODEL: { propertyName: "model", propertyObjectType: ObjectType.MODEL },
  TABLE: { propertyName: "tables", propertyObjectType: ObjectType.TABLE },
  OTHER_OBJECT: {
    propertyName: "otherObjects",
    propertyObjectType: ObjectType.OTHER_OBJECT
  },
  NOTE: { propertyName: "notes", propertyObjectType: ObjectType.NOTE },
  LINE: { propertyName: "lines", propertyObjectType: ObjectType.LINE },
  RELATION: {
    propertyName: "relations",
    propertyObjectType: ObjectType.RELATION
  },
  INDEX: { propertyName: "indexes", propertyObjectType: ObjectType.INDEX },
  KEY: { propertyName: "keys", propertyObjectType: ObjectType.KEY },
  COLUMN: { propertyName: "columns", propertyObjectType: ObjectType.COLUMN }
};

export const DiagramAreaMode = {
  ADD_TABLE: "addTable",
  ADD_COMPOSITE: "addComposite",
  ADD_DOCUMENT: "addDocument",
  ADD_INTERFACE: "addInterface",
  ADD_UNION: "addUnion",
  ADD_INPUT: "addInput",
  ADD_RELATION: "addRelation",
  ADD_RELATION_BELONGS: "addRelationBelongs",
  ADD_IMPLEMENTS: "addImplements",
  ADD_LINE: "addLine",
  ARROW: "arrow",
  ADD_NOTE: "addNote",
  ADD_TEXT_NOTE: "addTextNote",
  ADD_ENUM: "addEnum",
  ADD_SCALAR: "addScalar",
  ADD_MUTATION: "addMutation",
  ADD_QUERY: "addQuery",
  ADD_OTHER: "addOther",
  ADD_VIEW: "addView",
  ADD_FUNCTION: "addFunction",
  ADD_PROCEDURE: "addProcedure",
  ADD_TRIGGER: "addTrigger",
  ADD_MATERIALIZED_VIEW: "addMaterializedView",
  ADD_DOMAIN: "addDomain",
  ADD_TYPE_OTHER: "addTypeOther",
  ADD_RULE: "addRule",
  ADD_POLICY: "addPolicy",
  ADD_SEQUENCE: "addSequence",
  ADD_CHOICE: "addChoice",
  ADD_CONDITION: "addCondition",
  ADD_JSON_EXTERNAL_REF: "addJsonExternalRef",
  ADD_JSON_SCHEMA: "addJsonSchema",
  ADD_JSON_OBJECT: "addJsonObject",
  ADD_JSON_ARRAY: "addJsonArray",
  ADD_USER_DEFINED_TYPE: "addUserDefinedType"
};

export const BackupModelTime = {
  NEVER: "never",
  FIVE_SECONDS: "5seconds",
  MINUTE: "minute",
  FIVE_MINUTES: "5minutes"
};
