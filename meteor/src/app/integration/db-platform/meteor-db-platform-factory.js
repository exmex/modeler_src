class MeteorDbPlatformFactory {
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
    throw new Error(`Platform ${type} not found`);
  }

  createReverseCancelExecutor() {
    throw new Error(`Not implemented`);
  }
}

module.exports = MeteorDbPlatformFactory;
