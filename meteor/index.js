const { PRODUCT } = require("common");
process.env.CURRENT_PRODUCT = PRODUCT.METEOR_PRODUCT;
process.env.CURRENT_PRODUCT_DIR_NAME = __dirname;

const MeteorDbPlatformFactory = require("./src/app/integration/db-platform/meteor-db-platform-factory");
const { Integrations } = require("common");

const { getIntegrations } = require("electron-app");
getIntegrations().addIntegration(
  Integrations.DbPlatform,
  MeteorDbPlatformFactory
);
