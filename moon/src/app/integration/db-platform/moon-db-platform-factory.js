const MongoDBReverseExecutorBuilder = require("./mongodb/mongodb-reverse-builder");
const MongoDBTestConnectionExecutorBuilder = require("./mongodb/mongodb-test-connection-builder");

const { ModelTypes } = require("common");
const { CancelErrorExecutor } = require("electron-app");

class MoonDbPlatformFactory {
  constructor(filenameProvider, reverseProcessor, testConnectionProcessor) {
    this.filenameProvider = filenameProvider;
    this.reverseProcessor = reverseProcessor;
    this.testConnectionProcessor = testConnectionProcessor;
  }

  createTestConnectionExecutor(connection) {
    const type = connection.type;
    if (type === ModelTypes.PG) {
      return new PostgresTestConnectionExecutorBuilder(
        connection,
        this.filenameProvider,
        this.testConnectionProcessor
      ).build();
    } else if (type === ModelTypes.MYSQL) {
      return new MySQLTestConnectionExecutorBuilder(
        connection,
        this.filenameProvider,
        this.testConnectionProcessor
      ).build();
    } else if (type === ModelTypes.MARIADB) {
      return new MariaDBTestConnectionExecutorBuilder(
        connection,
        this.filenameProvider,
        this.testConnectionProcessor
      ).build();
    } else if (type === ModelTypes.MONGODB) {
      return new MongoDBTestConnectionExecutorBuilder(
        connection,
        this.filenameProvider,
        this.testConnectionProcessor
      ).build();
    }

    throw new Error(`Platform ${type} not found`);
  }

  createReverseExecutor(connection) {
    const type = connection.type;
    if (type === ModelTypes.PG) {
      return new PostgresReverseExecutorBuilder(
        connection,
        this.filenameProvider,
        this.reverseProcessor
      ).build();
    } else if (type === ModelTypes.MYSQL) {
      return new MySQLReverseExecutorBuilder(
        connection,
        this.filenameProvider,
        this.reverseProcessor
      ).build();
    } else if (type === ModelTypes.MARIADB) {
      return new MariaDBReverseExecutorBuilder(
        connection,
        this.filenameProvider,
        this.reverseProcessor
      ).build();
    } else if (type === ModelTypes.GRAPHQL) {
      return new GraphQLReverseExecutorBuilder(
        connection,
        this.filenameProvider,
        this.reverseProcessor
      ).build();
    } else if (type === ModelTypes.SQLITE) {
      return new SQLiteReverseExecutorBuilder(
        connection,
        this.filenameProvider,
        this.reverseProcessor
      ).build();
    } else if (type === ModelTypes.MONGODB) {
      return new MongoDBReverseExecutorBuilder(
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

module.exports = MoonDbPlatformFactory;
