const GraphQLReverseExecutorBuilder = require("./graphql/graphql-reverse-builder");

const { ModelTypes } = require("common");
const { CancelErrorExecutor } = require("electron-app");

class GalaxyDbPlatformFactory {
  constructor(filenameProvider, reverseProcessor, testConnectionProcessor) {
    this.filenameProvider = filenameProvider;
    this.reverseProcessor = reverseProcessor;
    this.testConnectionProcessor = testConnectionProcessor;
  }

  createTestConnectionExecutor(connection) {
    const type = connection.type;

    throw new Error(`Platform ${type} not found`);
  }

  createReverseExecutor(connection) {
    const type = connection.type;
    if (type === ModelTypes.GRAPHQL) {
      return new GraphQLReverseExecutorBuilder(
        connection,
        this.filenameProvider,
        this.reverseProcessor
      ).build();
    }

    throw new Error(`Platform ${type} not found`);
  }

  createReverseCancelExecutor() {
    return new CancelErrorExecutor(this.reverseProcessor, () => {
      // test purposes
    });
  }
}

module.exports = GalaxyDbPlatformFactory;
