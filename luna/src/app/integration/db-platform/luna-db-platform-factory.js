const SQLiteReverseExecutorBuilder = require("./sqlite/sqlite-reverse-builder");

const PostgresReverseExecutorBuilder = require("./pg/pg-reverse-builder");
const PostgresTestConnectionExecutorBuilder = require("./pg/pg-test-connection-builder");

const MSSQLReverseExecutorBuilder = require("./mssql/mssql-reverse-builder");
const MSSQLTestConnectionExecutorBuilder = require("./mssql/mssql-test-connection-builder");

const MySQLReverseExecutorBuilder = require("./mysql/mysql-reverse-builder");
const MySQLTestConnectionExecutorBuilder = require("./mysql/mysql-test-connection-builder");

const MariaDBReverseExecutorBuilder = require("./mariadb/mariadb-reverse-builder");
const MariaDBTestConnectionExecutorBuilder = require("./mariadb/mariadb-test-connection-builder");

const { ModelTypes } = require("common");
const { CancelErrorExecutor } = require("electron-app");

class LunaDbPlatformFactory {
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
    } else if (type === ModelTypes.MSSQL) {
      return new MSSQLTestConnectionExecutorBuilder(
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
    }

    throw new Error(`Platform ${type} not found`);
  }

  createReverseExecutor(connection, modelToUpdate) {
    const type = connection.type;
    if (type === ModelTypes.SQLITE) {
      return new SQLiteReverseExecutorBuilder(
        connection,
        modelToUpdate,
        this.filenameProvider,
        this.reverseProcessor
      ).build();
    } else if (type === ModelTypes.PG) {
      return new PostgresReverseExecutorBuilder(
        connection,
        modelToUpdate,
        this.filenameProvider,
        this.reverseProcessor
      ).build();
    } else if (type === ModelTypes.MSSQL) {
      return new MSSQLReverseExecutorBuilder(
        connection,
        modelToUpdate,
        this.filenameProvider,
        this.reverseProcessor
      ).build();
    } else if (type === ModelTypes.MYSQL) {
      return new MySQLReverseExecutorBuilder(
        connection,
        modelToUpdate,
        this.filenameProvider,
        this.reverseProcessor
      ).build();
    } else if (type === ModelTypes.MARIADB) {
      return new MariaDBReverseExecutorBuilder(
        connection,
        modelToUpdate,
        this.filenameProvider,
        this.reverseProcessor
      ).build();
    } else if (type === ModelTypes.SQLITE) {
      return new SQLiteReverseExecutorBuilder(
        connection,
        modelToUpdate,
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

module.exports = LunaDbPlatformFactory;
