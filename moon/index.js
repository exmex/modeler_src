const { PRODUCT } = require("common");
process.env.CURRENT_PRODUCT = PRODUCT.MOON_PRODUCT;
process.env.CURRENT_PRODUCT_DIR_NAME = __dirname;

const MoonDbPlatformFactory = require("./src/app/integration/db-platform/moon-db-platform-factory");
const { Integrations } = require("common");

const { getIntegrations } = require("electron-app");
getIntegrations().addIntegration(
  Integrations.DbPlatform,
  MoonDbPlatformFactory
);
