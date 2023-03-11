import { ModelTypes, ModelTypesForHumans } from "./enums/enums";

import { Features } from "./helpers/features/features";
import FullJSONIcon from "./assets/FullJSONIcon.svg";
import GraphQlIcon from "./assets/GraphQlIcon.svg";
import JSONSchemaIcon from "./assets/JSONSchemaIcon.svg";
import LogicalIcon from "./assets/LogicalIcon.svg";
import MariaDBIcon from "./assets/MariaDBIcon.svg";
import MongoDBIcon from "./assets/MongoDBIcon.svg";
import MongooseIcon from "./assets/MongooseIcon.svg";
import MySQLIcon from "./assets/MySQLIcon.svg";
import OpenAPIIcon from "./assets/OpenAPIIcon.svg";
import { PRODUCT } from "common";
import PostgreSQLIcon from "./assets/PostgreSQLIcon.svg";
import SQLiteIcon from "./assets/SQLiteIcon.svg";
import SequelizeIcon from "./assets/SequelizeIcon.svg";

export const getAvailableFeatures = () => {
  const product = process.env.REACT_APP_PRODUCT;
  switch (product) {
    case PRODUCT.MOON_PRODUCT:
      return [Features.DISABLED_CONNECTIONS];
    case PRODUCT.PERSEID_PRODUCT:
      return [Features.IMPORT_JSONSCHEMA];
    case PRODUCT.METEOR_PRODUCT:
    default:
      return [];
  }
};

export const getDefaultModeType = () => {
  const product = process.env.REACT_APP_PRODUCT;
  switch (product) {
    case PRODUCT.METEOR_PRODUCT:
      return getDefaultModeTypeMeteor();
    case PRODUCT.PERSEID_PRODUCT:
      return getDefaultModeTypePerseid();
    case PRODUCT.MOON_PRODUCT:
    default:
      return getDefaultModeTypeMoon();
  }
};

export const getDefaultSchema = (type) => {
  const product = process.env.REACT_APP_PRODUCT;
  switch (product) {
    case PRODUCT.PERSEID_PRODUCT:
      return getDefaultSchemaPerseid(type);
    case PRODUCT.METEOR_PRODUCT:
    case PRODUCT.MOON_PRODUCT:
    default:
      return "";
  }
};

const getDefaultModeTypeMeteor = () => {
  return ModelTypes.SEQUELIZE;
};

const getDefaultModeTypePerseid = () => {
  return ModelTypes.JSONSCHEMA;
};

const getDefaultModeTypeMoon = () => {
  return ModelTypes.MONGODB;
};

const getDefaultSchemaPerseid = (type) => {
  switch (type) {
    case ModelTypes.JSONSCHEMA:
      return "https://json-schema.org/draft/2020-12/schema";
    case ModelTypes.OPENAPI:
      return "3.1.0";
    case null:
    default:
      return "";
  }
};

export const getSupportedModelTypes = () => {
  const product = process.env.REACT_APP_PRODUCT;
  switch (product) {
    case PRODUCT.METEOR_PRODUCT:
      return getSupportedModelTypesMeteor();
    case PRODUCT.PERSEID_PRODUCT:
      return getSupportedModelTypesPerseid();
    case PRODUCT.MOON_PRODUCT:
    default:
      return getSupportedModelTypesMoon();
  }
};

const getSupportedModelTypesMeteor = () => {
  return [
    {
      id: ModelTypes.SEQUELIZE,
      text: ModelTypesForHumans.SEQUELIZE,
      icon: SequelizeIcon
    }
  ];
};

const getSupportedModelTypesPerseid = () => {
  return [
    {
      id: ModelTypes.JSONSCHEMA,
      text: ModelTypesForHumans.JSONSCHEMA,
      icon: JSONSchemaIcon
    },
    /*{
      id: ModelTypes.FULLJSON,
      text: ModelTypesForHumans.FULLJSON,
      icon: FullJSONIcon
    },*/
    {
      id: ModelTypes.OPENAPI,
      text: ModelTypesForHumans.OPENAPI,
      icon: OpenAPIIcon
    }
  ];
};

const getSupportedModelTypesMoon = () => {
  return [
    {
      id: ModelTypes.MONGODB,
      text: ModelTypesForHumans.MONGODB,
      icon: MongoDBIcon
    },
    {
      id: ModelTypes.MONGOOSE,
      text: ModelTypesForHumans.MONGOOSE,
      icon: MongooseIcon
    },
    {
      id: ModelTypes.PG,
      text: ModelTypesForHumans.PG,
      icon: PostgreSQLIcon
    },
    {
      id: ModelTypes.GRAPHQL,
      text: ModelTypesForHumans.GRAPHQL,
      icon: GraphQlIcon
    },
    {
      id: ModelTypes.MARIADB,
      text: ModelTypesForHumans.MARIADB,
      icon: MariaDBIcon
    },
    {
      id: ModelTypes.SQLITE,
      text: ModelTypesForHumans.SQLITE,
      icon: SQLiteIcon
    },
    {
      id: ModelTypes.MYSQL,
      text: ModelTypesForHumans.MYSQL,
      icon: MySQLIcon
    },
    {
      id: ModelTypes.LOGICAL,
      text: ModelTypesForHumans.LOGICAL,
      icon: LogicalIcon
    }
  ];
};
