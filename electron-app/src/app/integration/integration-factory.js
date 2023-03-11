const AutolayoutBuilder = require("./autolayout/autolayout-factory");
const ReverseProcessor = require("./db-platform/reverse-processor");
const TestConnectionProcessor = require("./db-platform/test-connection-processor");
const AutolayoutProcessor = require("./autolayout/autolayout-processor");
const getIntegrations = require("./integrations");
const { Integrations } = require("common");

class IntegrationFactory {
  constructor(dispatcher, filenameProvider) {
    this.dispatcher = dispatcher;
    this.filenameProvider = filenameProvider;
  }

  createAutolayoutFactory() {
    return new AutolayoutBuilder(
      this.filenameProvider,
      new AutolayoutProcessor(this.dispatcher)
    );
  }

  createDbPlatformFactory() {
    return getIntegrations().getIntegration(
      Integrations.DbPlatform,
      this.filenameProvider,
      new ReverseProcessor(this.dispatcher),
      new TestConnectionProcessor(this.dispatcher)
    );
  }
}

module.exports = IntegrationFactory;
