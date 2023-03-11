const { ChildProcessExecutor } = require("electron-app");
const { CancelErrorExecutor } = require("electron-app");
const path = require("path");
const { ModelTypes } = require("common");

class GraphQLReverseExecutorBuilder {
  constructor(connection, filenameProvider, payloadProcessor) {
    this.connection = connection;
    this.filenameProvider = filenameProvider;
    this.payloadProcessor = payloadProcessor;
  }

  getName() {
    if (this.connection.sourceType === "file") {
      const filename = this.connection.source[0];
      const ext = path.extname(filename);
      return path.basename(filename, ext);
    }
    return this.connection.source;
  }

  build() {
    if (!this.connection.source) {
      return new CancelErrorExecutor(this.payloadProcessor, () => {
        // This is intentional
      });
    }
    const infoFile = this.filenameProvider.buildFilename("graphqlinfo");
    const outputFile = this.filenameProvider.buildFilename("graphqlreverse");

    const args = [
      this.connection.sourceType,
      this.connection.source,
      outputFile,
      infoFile,
    ];

    const name = this.getName();

    const parameters = {
      args,
      infoFile,
      outputFile,
      name,
      env: { platform: ModelTypes.GRAPHQL },
    };

    return new ChildProcessExecutor(
      parameters,
      this.payloadProcessor,
      path.join(__dirname, "graphql-reverse-child-process.js"),
      () => {
        // This is intentional
      }
    );
  }
}

module.exports = GraphQLReverseExecutorBuilder;
