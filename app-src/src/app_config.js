import { ModelTypes, ModelTypesForHumans } from "./enums/enums";

import { Features } from "./helpers/features/features";
import GraphQlIcon from "./assets/GraphQlIcon.svg";
import JSONSchemaIcon from "./assets/JSONSchemaIcon.svg";
import LogicalIcon from "./assets/LogicalIcon.svg";
import MSSQLIcon from "./assets/MSSQLIcon.svg";
import MariaDBIcon from "./assets/MariaDBIcon.svg";
import MongoDBIcon from "./assets/MongoDBIcon.svg";
import MongooseIcon from "./assets/MongooseIcon.svg";
import MySQLIcon from "./assets/MySQLIcon.svg";
import OpenAPIIcon from "./assets/OpenAPIIcon.svg";
import { PRODUCT } from "common";
import PostgreSQLIcon from "./assets/PostgreSQLIcon.svg";
import SQLiteIcon from "./assets/SQLiteIcon.svg";
import SequelizeIcon from "./assets/SequelizeIcon.svg";
import _ from "lodash";

export const getAvailableFeatures = () => {
  const product = process.env.REACT_APP_PRODUCT;
  switch (product) {
    case PRODUCT.MOON_PRODUCT:
      return [
        Features.DISABLED_CONNECTIONS,
        Features.DISABLED_IMPORT_FROM_FILE
      ];
    case PRODUCT.LUNA_PRODUCT:
      return [Features.DISABLED_CONNECTIONS];
    case PRODUCT.GALAXY_PRODUCT:
      return [];
    case PRODUCT.PERSEID_PRODUCT:
      return [Features.IMPORT_FROM_FILE];
    case PRODUCT.METEOR_PRODUCT:
      return [Features.FREEWARE];
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
    case PRODUCT.LUNA_PRODUCT:
      return getDefaultModeTypeLuna();
    case PRODUCT.GALAXY_PRODUCT:
      return getDefaultModeTypeGalaxy();
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

const getDefaultModeTypeLuna = () => {
  return ModelTypes.PG;
};

const getDefaultModeTypeGalaxy = () => {
  return ModelTypes.GRAPHQL;
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

export const isSupportedModelType = (type) => {
  return !!_.find(
    getSupportedModelTypes(),
    (supported) => supported.id === type
  );
};

export const getProductByPlatform = (id) => {
  if (!!_.find(getSupportedModelTypesMeteor(), (type) => type.id === id)) {
    return PRODUCT.METEOR_PRODUCT;
  }
  if (!!_.find(getSupportedModelTypesPerseid(), (type) => type.id === id)) {
    return PRODUCT.PERSEID_PRODUCT;
  }
  if (!!_.find(getSupportedModelTypesLuna(), (type) => type.id === id)) {
    return PRODUCT.LUNA_PRODUCT;
  }
  if (!!_.find(getSupportedModelTypesGalaxy(), (type) => type.id === id)) {
    return PRODUCT.GALAXY_PRODUCT;
  }
  if (!!_.find(getSupportedModelTypesMoon(), (type) => type.id === id)) {
    return PRODUCT.MOON_PRODUCT;
  }
  return undefined;
};

export const getSupportedModelTypes = () => {
  const product = process.env.REACT_APP_PRODUCT;
  switch (product) {
    case PRODUCT.METEOR_PRODUCT:
      return getSupportedModelTypesMeteor();
    case PRODUCT.PERSEID_PRODUCT:
      return getSupportedModelTypesPerseid();
    case PRODUCT.LUNA_PRODUCT:
      return getSupportedModelTypesLuna();
    case PRODUCT.GALAXY_PRODUCT:
      return getSupportedModelTypesGalaxy();
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
      icon: SequelizeIcon,
      importFromFile: false,
      importFromURL: false,
      loadFromDatabase: false
    }
  ];
};

const getSupportedModelTypesPerseid = () => {
  return [
    {
      id: ModelTypes.JSONSCHEMA,
      text: ModelTypesForHumans.JSONSCHEMA,
      icon: JSONSchemaIcon,
      importFromFile: true,
      importFromURL: false,
      loadFromDatabase: false
    },
    {
      id: ModelTypes.OPENAPI,
      text: ModelTypesForHumans.OPENAPI,
      icon: OpenAPIIcon,
      importFromFile: true,
      importFromURL: false,
      loadFromDatabase: false
    }
  ];
};

const getSupportedModelTypesMoon = () => {
  return [
    {
      id: ModelTypes.MONGODB,
      text: ModelTypesForHumans.MONGODB,
      icon: MongoDBIcon,
      importFromFile: false,
      importFromURL: false,
      loadFromDatabase: true
    },
    {
      id: ModelTypes.MONGOOSE,
      text: ModelTypesForHumans.MONGOOSE,
      icon: MongooseIcon,
      importFromFile: false,
      importFromURL: false,
      loadFromDatabase: false
    }
  ];
};

const getSupportedModelTypesLuna = () => {
  return [
    {
      id: ModelTypes.PG,
      text: ModelTypesForHumans.PG,
      icon: PostgreSQLIcon,
      importFromFile: false,
      importFromURL: false,
      loadFromDatabase: true
    },
    {
      id: ModelTypes.MARIADB,
      text: ModelTypesForHumans.MARIADB,
      icon: MariaDBIcon,
      importFromFile: false,
      importFromURL: false,
      loadFromDatabase: true
    },
    {
      id: ModelTypes.SQLITE,
      text: ModelTypesForHumans.SQLITE,
      icon: SQLiteIcon,
      importFromFile: false,
      importFromURL: false,
      loadFromDatabase: true
    },
    {
      id: ModelTypes.MSSQL,
      text: ModelTypesForHumans.MSSQL,
      icon: MSSQLIcon,
      importFromFile: false,
      importFromURL: false,
      loadFromDatabase: true
    },
    {
      id: ModelTypes.MYSQL,
      text: ModelTypesForHumans.MYSQL,
      icon: MySQLIcon,
      importFromFile: false,
      importFromURL: false,
      loadFromDatabase: true
    },
    {
      id: ModelTypes.LOGICAL,
      text: ModelTypesForHumans.LOGICAL,
      icon: LogicalIcon
    }
  ];
};

const getSupportedModelTypesGalaxy = () => {
  return [
    {
      id: ModelTypes.GRAPHQL,
      text: ModelTypesForHumans.GRAPHQL,
      icon: GraphQlIcon,
      importFromFile: true,
      importFromURL: true,
      loadFromDatabase: false
    }
  ];
};
