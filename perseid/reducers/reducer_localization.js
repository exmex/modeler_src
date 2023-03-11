import { ModelTypes } from "../enums/enums";
import { SET_LOCALIZATION } from "../actions/localization";

const texts = {
  GENERATE: "Generate",
  COPY_TO_CLIPBOARD: "Copy to clipboard",
  ONLINE_SAVE:
    "Online demo mode allows you to save a project with 10 objects at maximum.",
  FREEWARE_SAVE:
    "Freeware mode allows you to save a project with 10 objects at maximum.",
  //"Beta version allows you to save a project with 10 objects at maximum.",
  FREEWARE_TABLES:
    "Freeware limit of 10 objects in a project exceeded. If you want to save the project, reduce the number of objects to 10 or purchase a commercial license.",
  //"Beta version limit of 10 objects in a project exceeded. If you want to save the project, reduce the number of objects to 10 or purchase a commercial license.",
  PROJECT_SAVE: "Project saved successfully.",
  PROJECT_OPEN: "Project opened successfully.",
  SSH_TLS_REVERSE_ON_NON_PRO:
    "Secure SSH/TLS connections are fully supported only in Moon Modeler Professional. Create a connection without SSH/TLS or upgrade to the Professional edition."
};

const INITIAL_STATE = {
  L_MARIADB: {
    TEXTS: texts,
    L_MODELS: "projects",
    L_MODEL: "project",
    L_DIAGRAM: "diagram",
    L_DIAGRAMS: "diagrams",
    L_TABLES: "tables",
    L_TABLE: "table",
    L_RELATIONS: "relationships",
    L_RELATION: "relationship",
    L_SCRIPT: "SQL script",
    L_COLUMNS: "columns",
    L_COLUMN: "column",
    L_RELATION_BUTTON2: "relationship",
    L_RELATION_BUTTON: "relationship",
    L_TYPE: "type",
    L_NN: "nn",
    L_PK: "pk",
    L_FK: "fk",
    L_LIST: "arr",
    L_TABLE_EMBEDDABLE: "json",
    L_TABLES_EMBEDDABLE: "json",
    L_LINE_BUTTON: "line",
    L_LINES: "lines",
    L_LINE: "line",
    L_CONNECTION: "connection",
    L_CONNECTIONS: "connections",
    L_CONTAINER: "database",
    L_VIEWS: "views",
    L_MATERIALIZED_VIEWS: "materialized views",
    L_FUNCTIONS: "functions",
    L_PROCEDURES: "procedures",
    L_TRIGGERS: "triggers",
    L_OTHERS: "others",
    L_NOTES: "notes",
    L_KEYS: "keys",
    L_INDEXES: "indexes"
  },
  L_MYSQL: {
    TEXTS: texts,
    L_MODELS: "projects",
    L_MODEL: "project",
    L_TABLES: "tables",
    L_TABLE: "table",
    L_RELATIONS: "relationships",
    L_RELATION: "relationship",
    L_SCRIPT: "SQL script",
    L_COLUMNS: "columns",
    L_COLUMN: "column",
    L_RELATION_BUTTON2: "relationship",
    L_RELATION_BUTTON: "relationship",
    L_TYPE: "type",
    L_NN: "nn",
    L_PK: "pk",
    L_FK: "fk",
    L_LIST: "arr",
    L_TABLE_EMBEDDABLE: "json",
    L_TABLES_EMBEDDABLE: "json",
    L_LINE_BUTTON: "line",
    L_LINES: "lines",
    L_LINE: "line",
    L_CONNECTION: "connection",
    L_CONNECTIONS: "connections",
    L_CONTAINER: "database",
    L_VIEWS: "views",
    L_MATERIALIZED_VIEWS: "materialized views",
    L_FUNCTIONS: "functions",
    L_PROCEDURES: "procedures",
    L_TRIGGERS: "triggers",
    L_OTHERS: "others",
    L_NOTES: "notes",
    L_KEYS: "keys",
    L_INDEXES: "indexes"
  },
  L_PG: {
    TEXTS: texts,
    L_MODELS: "projects",
    L_MODEL: "project",
    L_DIAGRAM: "diagram",
    L_DIAGRAMS: "diagrams",
    L_TABLES: "tables",
    L_TABLE: "table",
    L_RELATIONS: "relationships",
    L_RELATION: "relationship",
    L_SCRIPT: "SQL script",
    L_COLUMNS: "columns",
    L_COLUMN: "column",
    L_RELATION_BUTTON2: "relationship",
    L_RELATION_BUTTON: "relationship",
    L_TYPE: "type",
    L_TYPES: "types",
    L_NN: "nn",
    L_PK: "pk",
    L_FK: "fk",
    L_LIST: "arr",
    L_TABLE_EMBEDDABLE: "json",
    L_TABLES_EMBEDDABLE: "json",
    L_LINE_BUTTON: "line",
    L_LINES: "lines",
    L_LINE: "line",
    L_CONNECTION: "connection",
    L_CONNECTIONS: "connections",
    L_COMPOSITE: "composite",
    L_COMPOSITES: "composites",
    L_MATERIALIZED_VIEW: "materialized view",
    L_MATERIALIZED_VIEWS: "materialized views",
    L_VIEW: "view",
    L_VIEWS: "views",
    L_INDEX: "index",
    L_INDEXES: "indexes",
    L_KEY: "key",
    L_KEYS: "keys",
    L_NOTE: "note",
    L_NOTES: "notes",
    L_OTHER: "other",
    L_OTHERS: "others",
    L_TRIGGER: "trigger",
    L_TRIGGERS: "triggers",
    L_SEQUENCE: "sequence",
    L_SEQUENCES: "sequences",
    L_DOMAIN: "domain",
    L_DOMAINS: "domains",
    L_FUNCTION: "function",
    L_FUNCTIONS: "functions",
    L_POLICY: "policy",
    L_POLICIES: "policies",
    L_RULE: "rule",
    L_RULES: "rules",
    L_PROCEDURE: "procedure",
    L_PROCEDURES: "procedures",
    L_ENUM: "enum",
    L_ENUMS: "enums",
    L_CONTAINER: "schema"
  },
  L_SEQUELIZE: {
    TEXTS: texts,
    L_MODELS: "projects",
    L_MODEL: "project",
    L_DIAGRAM: "diagram",
    L_DIAGRAMS: "diagrams",
    L_TABLES: "models",
    L_TABLE: "model",
    L_RELATIONS: "associations",
    L_RELATION: "association",
    L_SCRIPT: "ORM Script",
    L_COLUMNS: "fields",
    L_COLUMN: "field",
    L_RELATION_BUTTON2: "belongsTo",
    L_RELATION_BUTTON: "hasOne",
    L_TYPE: "type",
    L_NN: "req",
    L_PK: "key",
    L_FK: "fk",
    L_LIST: "arr",
    L_TABLE_EMBEDDABLE: "embed",
    L_TABLES_EMBEDDABLE: "embed",
    L_LINE_BUTTON: "line",
    L_LINES: "lines",
    L_LINE: "line",
    L_NOTES: "notes",
    L_OTHERS: "others"
  },

  L_MONGODB: {
    TEXTS: texts,
    L_MODELS: "projects",
    L_MODEL: "project",
    L_DIAGRAM: "diagram",
    L_DIAGRAMS: "diagrams",
    L_TABLES: "collections",
    L_TABLE: "collection",
    L_TABLES_EMBEDDABLE: "documents",
    L_TABLE_EMBEDDABLE: "document",
    L_RELATIONS: "references",
    L_RELATION: "reference",
    L_SCRIPT: "script",
    L_COLUMNS: "fields",
    L_COLUMN: "field",
    L_RELATION_BUTTON2: "reference",
    L_RELATION_BUTTON: "reference",
    L_TYPE: "type",
    L_NN: "nn",
    L_PK: "id",
    L_FK: "fk",
    L_LIST: "arr",
    L_LINE_BUTTON: "line",
    L_LINES: "lines",
    L_LINE: "line",
    L_CONNECTION: "connection",
    L_CONNECTIONS: "connections",
    L_VIEWS: "views",
    L_FUNCTIONS: "functions",
    L_OTHERS: "others",
    L_NOTES: "notes",
    L_KEYS: "keys",
    L_INDEXES: "indexes"
  },
  L_LOGICAL: {
    TEXTS: texts,
    L_MODELS: "projects",
    L_MODEL: "project",
    L_DIAGRAM: "diagram",
    L_DIAGRAMS: "diagrams",
    L_TABLES: "entities",
    L_TABLE: "entity",
    L_TABLES_EMBEDDABLE: "json",
    L_TABLE_EMBEDDABLE: "json",
    L_RELATIONS: "relationships",
    L_RELATION: "relationship",
    L_SCRIPT: "script",
    L_COLUMNS: "attributes",
    L_COLUMN: "attribute",
    L_RELATION_BUTTON2: "relationships",
    L_RELATION_BUTTON: "relationship",
    L_TYPE: "type",
    L_NN: "nn",
    L_PK: "id",
    L_FK: "fk",
    L_LIST: "arr",
    L_LINE_BUTTON: "line",
    L_LINES: "lines",
    L_LINE: "line",
    L_CONNECTION: "connection",
    L_CONNECTIONS: "connections",
    L_OTHERS: "others",
    L_NOTES: "notes",
    L_KEYS: "keys",
    L_INDEXES: "indexes"
  },

  L_JSONSCHEMA: {
    TEXTS: texts,
    L_MODELS: "projects",
    L_MODEL: "project",
    L_DIAGRAM: "diagram",
    L_DIAGRAMS: "diagrams",
    L_TABLES: "schemas",
    L_TABLE: "schema",
    L_TABLES_EMBEDDABLE: "subschemas",
    L_TABLE_EMBEDDABLE: "subschema",
    L_RELATIONS: "relationships",
    L_RELATION: "relationship",
    L_SCRIPT: "script",
    L_COLUMNS: "children",
    L_COLUMN: "",
    L_RELATION_BUTTON2: "relationships",
    L_RELATION_BUTTON: "relationship",
    L_TYPE: "type",
    L_NN: "R",
    L_PK: "id",
    L_FK: "fk",
    L_LIST: "arr",
    L_LINE_BUTTON: "line",
    L_LINES: "lines",
    L_LINE: "line",
    L_CONNECTION: "connection",
    L_CONNECTIONS: "connections",
    L_SUBSCHEMAS: "subschemas",
    L_EXTERNALREFS: "external refs",
    L_ROOT: "json schema"
  },
  L_OPENAPI: {
    TEXTS: texts,
    L_MODELS: "projects",
    L_MODEL: "project",
    L_DIAGRAM: "diagram",
    L_DIAGRAMS: "diagrams",
    L_TABLES: "schemas",
    L_TABLE: "schema",
    L_TABLES_EMBEDDABLE: "subschemas",
    L_TABLE_EMBEDDABLE: "subschema",
    L_RELATIONS: "relationships",
    L_RELATION: "relationship",
    L_SCRIPT: "script",
    L_COLUMNS: "children",
    L_COLUMN: "",
    L_RELATION_BUTTON2: "relationships",
    L_RELATION_BUTTON: "relationship",
    L_TYPE: "type",
    L_NN: "R",
    L_PK: "id",
    L_FK: "fk",
    L_LIST: "arr",
    L_LINE_BUTTON: "line",
    L_LINES: "lines",
    L_LINE: "line",
    L_CONNECTION: "connection",
    L_CONNECTIONS: "connections",
    L_SUBSCHEMAS: "subschemas",
    L_EXTERNALREFS: "external refs",
    L_ROOT: "open api"
  },
  L_FULLJSON: {
    TEXTS: texts,
    L_MODELS: "projects",
    L_MODEL: "project",
    L_DIAGRAM: "diagram",
    L_DIAGRAMS: "diagrams",
    L_TABLES: "schemas",
    L_TABLE: "schema",
    L_TABLES_EMBEDDABLE: "subschemas",
    L_TABLE_EMBEDDABLE: "subschema",
    L_RELATIONS: "relationships",
    L_RELATION: "relationship",
    L_SCRIPT: "script",
    L_COLUMNS: "children",
    L_COLUMN: "",
    L_RELATION_BUTTON2: "relationships",
    L_RELATION_BUTTON: "relationship",
    L_TYPE: "type",
    L_NN: "R",
    L_PK: "id",
    L_FK: "fk",
    L_LIST: "arr",
    L_LINE_BUTTON: "line",
    L_LINES: "lines",
    L_LINE: "line",
    L_CONNECTION: "connection",
    L_CONNECTIONS: "connections",
    L_SUBSCHEMAS: "subschemas",
    L_EXTERNALREFS: "external refs",
    L_ROOT: "root object"
  },
  L_GRAPHQL: {
    TEXTS: texts,
    L_MODELS: "projects",
    L_MODEL: "project",
    L_DIAGRAM: "diagram",
    L_DIAGRAMS: "diagrams",
    L_TABLES: "types",
    L_TABLE: "type",
    L_INTERFACES: "interfaces",
    L_INTERFACE: "interface",
    L_IMPLEMENTS: "implements",
    L_INPUTS: "inputs",
    L_INPUT: "input",
    L_ENUMS: "enums",
    L_ENUM: "enum",
    L_SCALARS: "scalars",
    L_SCALAR: "scalar",
    L_QUERIES: "queries",
    L_QUERY: "query",
    L_MUTATIONS: "mutations",
    L_MUTATION: "mutation",
    L_UNIONS: "unions",
    L_UNION: "union",
    L_TABLES_EMBEDDABLE: "types",
    L_TABLE_EMBEDDABLE: "type",
    L_RELATIONS: "references",
    L_RELATION: "reference",
    L_SCRIPT: "script",
    L_COLUMNS: "fields",
    L_COLUMN: "field",
    L_RELATION_BUTTON2: "reference",
    L_RELATION_BUTTON: "reference",
    L_IMPLEMENTS_BUTTON: "implements",
    L_TYPE: "type",
    L_NN: "nn",
    L_PK: "id",
    L_FK: "fk",
    L_LIST: "arr",
    L_LINE_BUTTON: "line",
    L_LINES: "lines",
    L_LINE: "line",
    L_CONNECTION: "connection",
    L_CONNECTIONS: "connections",
    L_NOTES: "notes"
  },

  L_MONGOOSE: {
    TEXTS: texts,
    L_MODELS: "projects",
    L_MODEL: "project",
    L_DIAGRAM: "diagram",
    L_DIAGRAMS: "diagrams",
    L_TABLES: "schemas",
    L_TABLE: "schema",
    L_TABLES_EMBEDDABLE: "nested types",
    L_TABLE_EMBEDDABLE: "nested type",
    L_RELATIONS: "references",
    L_RELATION: "reference",
    L_SCRIPT: "script",
    L_COLUMNS: "properties",
    L_COLUMN: "property",
    L_RELATION_BUTTON2: "reference",
    L_RELATION_BUTTON: "reference",
    L_TYPE: "type",
    L_NN: "nn",
    L_PK: "id",
    L_FK: "fk",
    L_LIST: "arr",
    L_LINE_BUTTON: "line",
    L_LINES: "lines",
    L_LINE: "line",
    L_CONNECTION: "connection",
    L_CONNECTIONS: "connections",
    L_ENUMS: "enums",
    L_OTHERS: "others",
    L_NOTES: "notes",
    L_KEYS: "keys"
  },

  L_SQLITE: {
    TEXTS: texts,
    L_MODELS: "projects",
    L_MODEL: "project",
    L_TABLES: "tables",
    L_TABLE: "table",
    L_RELATIONS: "relationships",
    L_RELATION: "relationship",
    L_SCRIPT: "SQL script",
    L_COLUMNS: "columns",
    L_COLUMN: "column",
    L_RELATION_BUTTON2: "relationship",
    L_RELATION_BUTTON: "relationship",
    L_TYPE: "type",
    L_NN: "nn",
    L_PK: "pk",
    L_FK: "fk",
    L_LIST: "arr",
    L_TABLE_EMBEDDABLE: "json",
    L_TABLES_EMBEDDABLE: "json",
    L_LINE_BUTTON: "line",
    L_LINES: "lines",
    L_LINE: "line",
    L_CONTAINER: "database",
    L_VIEWS: "views",
    L_TRIGGERS: "triggers",
    L_OTHERS: "others",
    L_NOTES: "notes",
    L_KEYS: "keys",
    L_INDEXES: "indexes"
  }
};

export default function (state = INITIAL_STATE.L_MARIADB, action = {}) {
  switch (action.type) {
    case SET_LOCALIZATION:
      var dictionary;

      if (action.payload === "SEQUELIZE") {
        dictionary = INITIAL_STATE.L_SEQUELIZE;
      } else if (action.payload === "MONGODB") {
        dictionary = INITIAL_STATE.L_MONGODB;
      } else if (action.payload === "GRAPHQL") {
        dictionary = INITIAL_STATE.L_GRAPHQL;
      } else if (action.payload === "MONGOOSE") {
        dictionary = INITIAL_STATE.L_MONGOOSE;
      } else if (action.payload === "PG") {
        dictionary = INITIAL_STATE.L_PG;
      } else if (action.payload === ModelTypes.SQLITE) {
        dictionary = INITIAL_STATE.L_SQLITE;
      } else if (action.payload === "LOGICAL") {
        dictionary = INITIAL_STATE.L_LOGICAL;
      } else if (action.payload === "JSONSCHEMA") {
        dictionary = INITIAL_STATE.L_JSONSCHEMA;
      } else if (action.payload === "OPENAPI") {
        dictionary = INITIAL_STATE.L_OPENAPI;
      } else if (action.payload === "FULLJSON") {
        dictionary = INITIAL_STATE.L_FULLJSON;
      } else {
        dictionary = INITIAL_STATE.L_MARIADB;
      }
      return dictionary;
    default:
      return state;
  }
}
