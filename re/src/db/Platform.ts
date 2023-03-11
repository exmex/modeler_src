export enum Platform {
  PG = "PG",
  MARIADB = "MARIADB",
  MYSQL = "MYSQL",
  MSSQL = "MSSQL",
  SQLITE = "SQLITE",
  GRAPHQL = "GRAPHQL",
  JSONSCHEMA = "JSONSCHEMA",
  MONGODB = "MONGODB",
  OPENAPI = "OPENAPI",
  FULLJSON = "FULLJSON",
  JSON = "JSON"
}

export const PlatformForHumans = {
  [Platform.GRAPHQL]: "GraphQL",
  [Platform.MARIADB]: "MariaDB",
  [Platform.MONGODB]: "MongoDB",
  [Platform.MYSQL]: "MySQL",
  [Platform.MSSQL]: "SQL Server",
  [Platform.PG]: "PostgreSQL",
  [Platform.SQLITE]: "SQLite",
  [Platform.JSONSCHEMA]: "JSON Schema",
  [Platform.OPENAPI]: "Open API",
  [Platform.FULLJSON]: "JSON",
  [Platform.JSON]: "JSON"
};
