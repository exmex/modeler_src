const { ChildProcessExecutor } = require("electron-app");
const { CancelErrorExecutor } = require("electron-app");
const path = require("path");
const fs = require("fs");
const { ModelTypes } = require("common");

class SQLiteReverseExecutorBuilder {
  constructor(connection, modelToUpdate, filenameProvider, payloadProcessor) {
    this.connection = connection;
    this.modelToUpdate = modelToUpdate;
    this.filenameProvider = filenameProvider;
    this.payloadProcessor = payloadProcessor;
  }

  build() {
    if (!this.connection.filePath) {
      return new CancelErrorExecutor(this.payloadProcessor, () => {
        // test purpose
      });
    }

    const infoFile = this.filenameProvider.buildFilename("sqliteinfo");
    const outputFile = this.filenameProvider.buildFilename("sqlitereverse");

    const originalModelFile = this.modelToUpdate
      ? this.filenameProvider.buildFilename("sqliteoriginal")
      : undefined;
    if (originalModelFile) {
      console.log(`Writing file ${originalModelFile} with model`);
      fs.writeFileSync(
        originalModelFile,
        JSON.stringify(this.modelToUpdate, null, 2)
      );
    }

    const args = [
      this.connection.filePath,
      outputFile,
      infoFile,
      originalModelFile,
      this.connection.id,
      this.connection.name
    ];

    const filename = this.connection.filePath;
    const ext = path.extname(filename);
    const name = path.basename(filename, ext);

    const parameters = {
      args,
      infoFile,
      outputFile,
      name,
      env: { platform: ModelTypes.SQLITE }
    };

    return new ChildProcessExecutor(
      parameters,
      this.payloadProcessor,
      path.join(__dirname, "sqlite-reverse-child-process.js"),
      () => {
        // This is intentional
      }
    );
  }
}

module.exports = SQLiteReverseExecutorBuilder;
