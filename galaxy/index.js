const { PRODUCT } = require("common");
process.env.CURRENT_PRODUCT = PRODUCT.GALAXY_PRODUCT;
process.env.CURRENT_PRODUCT_DIR_NAME = __dirname;

const GalaxyDbPlatformFactory = require("./src/app/integration/db-platform/galaxy-db-platform-factory");
const { Integrations } = require("common");

const { getIntegrations } = require("electron-app");
getIntegrations().addIntegration(
  Integrations.DbPlatform,
  GalaxyDbPlatformFactory
);
