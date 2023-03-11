const { PRODUCT } = require("common");
process.env.CURRENT_PRODUCT = PRODUCT.LUNA_PRODUCT;
process.env.CURRENT_PRODUCT_DIR_NAME = __dirname;
process.env.REACT_DEBUG = true;

const LunaDbPlatformFactory = require("./src/app/integration/db-platform/luna-db-platform-factory");
const { Integrations } = require("common");

const { getIntegrations } = require("electron-app");
getIntegrations().addIntegration(
  Integrations.DbPlatform,
  LunaDbPlatformFactory
);
