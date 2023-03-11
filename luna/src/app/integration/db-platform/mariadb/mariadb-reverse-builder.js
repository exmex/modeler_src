const { ChildProcessExecutor } = require("electron-app");
const { Platform } = require("re");
const path = require("path");
const fs = require("fs");

class MariaDbReverseExecutorBuilder {
  constructor(connection, modelToUpdate, filenameProvider, payloadProcessor) {
    this.connection = connection;
    this.modelToUpdate = modelToUpdate;
    this.filenameProvider = filenameProvider;
    this.payloadProcessor = payloadProcessor;
  }

  build() {
    const infoFile = this.filenameProvider.buildFilename("mariadbinfo");
    const outputFile = this.filenameProvider.buildFilename("mariadbreverse");

    const originalModelFile = this.modelToUpdate
      ? this.filenameProvider.buildFilename("mariadboriginal")
      : undefined;
    if (originalModelFile) {
      console.log(`Writing file ${originalModelFile} with model`);
      fs.writeFileSync(
        originalModelFile,
        JSON.stringify(this.modelToUpdate, null, 2)
      );
    }

    const limit =
      this.connection.noLimit === true ? 0 : this.connection.dataLimit;

    const args = [
      outputFile,
      this.connection.server + ":" + this.connection.port,
      this.connection.user ?? "",
      this.connection.database ?? "",
      this.connection.password ?? "",
      infoFile,
      this.connection.sshEnabled,
      this.connection.sshhost ?? "",
      this.connection.sshport ?? "",
      this.connection.sshusername ?? "",
      this.connection.sshpassword ?? "",
      this.connection.sshprivatekey ?? "",
      this.connection.sshpassphrase ?? "",
      this.connection.parseData === false ? -1 : limit,
      this.connection.sslEnabled,
      this.connection.sslRejectUnauthorized,
      this.connection.sslCA ?? "",
      this.connection.sslCert ?? "",
      this.connection.sslKey ?? "",
      this.connection.sslPassPhrase ?? "",
      this.connection.sslServerName ?? "",
      originalModelFile ?? "",
      this.connection.id,
      this.connection.name
    ];

    const parameters = {
      args,
      infoFile,
      outputFile,
      name: this.connection.name,
      env: {
        platform: Platform.MARIADB,
        sshEnabled: this.connection.sshEnabled,
        sslEnabled: this.connection.sslEnabled,
        sslRejectUnauthorized: this.connection.sslRejectUnauthorized,
        parseData: this.connection.parseData
      }
    };

    return new ChildProcessExecutor(
      parameters,
      this.payloadProcessor,
      path.join(__dirname, "mariadb-reverse-child-process.js"),
      () => {
        // This is intentional
      }
    );
  }
}

module.exports = MariaDbReverseExecutorBuilder;
