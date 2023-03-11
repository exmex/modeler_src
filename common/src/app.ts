import semver from "semver";

const ModelTypes = {
  GRAPHQL: "GRAPHQL",
  JSON: "JSON",
  MARIADB: "MARIADB",
  MONGODB: "MONGODB",
  MONGOOSE: "MONGOOSE",
  MYSQL: "MYSQL",
  PG: "PG",
  SEQUELIZE: "SEQUELIZE",
  SQLITE: "SQLITE",
  LOGICAL: "LOGICAL",
  JSONSCHEMA: "JSONSCHEMA",
  OPENAPI: "OPENAPI",
  FULLJSON: "FULLJSON",
  MSSQL: "MSSQL"
};

const PRODUCT = {
  METEOR_PRODUCT: "meteor",
  MOON_PRODUCT: "moon",
  LUNA_PRODUCT: "luna",
  GALAXY_PRODUCT: "galaxy",
  PERSEID_PRODUCT: "perseid"
};

const APP_NAME = {
  METEOR_APP_NAME: "MeteorModeler",
  MOON_APP_NAME: "MoonModeler",
  LUNA_APP_NAME: "LunaModeler",
  GALAXY_APP_NAME: "GalaxyModeler",
  PERSEID_APP_NAME: "PerseidModeler",
  NOT_DEFINED_NAME: "NotDefined"
};

const APP_TITLE = {
  METEOR_APP_NAME: "Meteor Modeler",
  MOON_APP_NAME: "Moon Modeler",
  LUNA_APP_NAME: "Luna Modeler",
  GALAXY_APP_NAME: "Galaxy Modeler",
  PERSEID_APP_NAME: "Perseid Modeler"
};

const APP_ID = {
  METEOR_APP_ID: "com.meteormodeler.app",
  MOON_APP_ID: "com.moonmodeler.app",
  LUNA_APP_ID: "com.lunamodeler.app",
  GALAXY_APP_ID: "com.galaxymodeler.app",
  PERSEID_APP_ID: "com.perseidmodeler.app"
};

function getAppTitle(productName: string) {
  switch (productName) {
    case PRODUCT.METEOR_PRODUCT:
      return APP_TITLE.METEOR_APP_NAME;
    case PRODUCT.PERSEID_PRODUCT:
      return APP_TITLE.PERSEID_APP_NAME;
    case PRODUCT.MOON_PRODUCT:
      return APP_TITLE.MOON_APP_NAME;
    case PRODUCT.LUNA_PRODUCT:
      return APP_TITLE.LUNA_APP_NAME;
    case PRODUCT.GALAXY_PRODUCT:
      return APP_TITLE.GALAXY_APP_NAME;
    default:
      throw buildError(productName);
  }
}

function buildError(productName: string) {
  return new Error(`Product ${productName} not found`);
}

function getAppName(productName: string) {
  switch (productName) {
    case PRODUCT.METEOR_PRODUCT:
      return APP_NAME.METEOR_APP_NAME;
    case PRODUCT.PERSEID_PRODUCT:
      return APP_NAME.PERSEID_APP_NAME;
    case PRODUCT.MOON_PRODUCT:
      return APP_NAME.MOON_APP_NAME;
    case PRODUCT.LUNA_PRODUCT:
      return APP_NAME.LUNA_APP_NAME;
    case PRODUCT.GALAXY_PRODUCT:
      return APP_NAME.GALAXY_APP_NAME;
    default:
      return APP_NAME.NOT_DEFINED_NAME;
  }
}

function getAppVersion(productName: string) {
  switch (productName) {
    case PRODUCT.METEOR_PRODUCT:
      return "6.1.0";
    case PRODUCT.PERSEID_PRODUCT:
      return "1.3.0";
    case PRODUCT.MOON_PRODUCT:
      return "6.1.0";
    case PRODUCT.LUNA_PRODUCT:
      return "6.1.0";
    case PRODUCT.GALAXY_PRODUCT:
      return "6.1.0";
    default:
      return "0.0.0";
  }
}

function getAppId(productName: string) {
  switch (productName) {
    case PRODUCT.METEOR_PRODUCT:
      return APP_ID.METEOR_APP_ID;
    case PRODUCT.PERSEID_PRODUCT:
      return APP_ID.PERSEID_APP_ID;
    case PRODUCT.MOON_PRODUCT:
      return APP_ID.MOON_APP_ID;
    case PRODUCT.LUNA_PRODUCT:
      return APP_ID.LUNA_APP_ID;
    case PRODUCT.GALAXY_PRODUCT:
      return APP_ID.GALAXY_APP_ID;
    default:
      throw buildError(productName);
  }
}

function getAppVersionObject(productName: string) {
  const version = semver.parse(getAppVersion(productName));
  return {
    major: version.major ?? 1,
    minor: version.minor ?? 0,
    extra: version.patch ?? 0
  };
}

export const OtherObjectTypes = {
  Other: "Other",
  View: "View",
  Trigger: "Trigger",
  Sequence: "Sequence",
  Procedure: "Procedure",
  Function: "Function",
  Query: "Query",
  Mutation: "Mutation",
  Enum: "Enum",
  Scalar: "Scalar",
  MaterializedView: "MaterializedView",
  Domain: "Domain",
  Rule: "Rule",
  Policy: "Policy",
  TypeOther: "TypeOther",
  UserDefinedType: "UserDefinedType"
};

export {
  ModelTypes,
  PRODUCT,
  APP_NAME,
  APP_TITLE,
  APP_ID,
  getAppTitle,
  getAppName,
  getAppVersion,
  getAppVersionObject,
  getAppId
};
