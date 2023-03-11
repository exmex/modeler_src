const { ChildProcessExecutor } = require("electron-app");
const { Platform } = require("re");
const path = require("path");
const fs = require("fs");

class MSSQLReverseExecutorBuilder {
  constructor(connection, modelToUpdate, filenameProvider, payloadProcessor) {
    console.log("MSSQLReverseExecutorBuilder");
    this.connection = connection;
    this.modelToUpdate = modelToUpdate;
    this.filenameProvider = filenameProvider;
    this.payloadProcessor = payloadProcessor;
  }

  build() {
    const infoFile = this.filenameProvider.buildFilename("mssqlinfo");
    const outputFile = this.filenameProvider.buildFilename("mssqlreverse");

    const originalModelFile = this.modelToUpdate
      ? this.filenameProvider.buildFilename("mssqloriginal")
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
      this.connection.server,
      this.connection.port,
      this.connection.database,
      this.connection.user,
      this.connection.password,
      infoFile,
      this.connection.sshEnabled,
      this.connection.sshhost ? this.connection.sshhost : "",
      this.connection.sshport ? this.connection.sshport : "",
      this.connection.sshusername ? this.connection.sshusername : "",
      this.connection.sshpassword ? this.connection.sshpassword : "",
      this.connection.sshprivatekey ? this.connection.sshprivatekey : "",
      this.connection.sshpassphrase ? this.connection.sshpassphrase : "",
      this.connection.includeSchema,
      this.connection.parseData === false ? -1 : limit,
      this.connection.sslEnabled,
      this.connection.sslRejectUnauthorized,
      this.connection.sslCA ? this.connection.sslCA : "",
      this.connection.sslCert ? this.connection.sslCert : "",
      this.connection.sslKey ? this.connection.sslKey : "",
      this.connection.sslPassPhrase ? this.connection.sslPassPhrase : "",
      this.connection.sslServerName ? this.connection.sslServerName : "",
      originalModelFile,
      this.connection.id,
      this.connection.name,
      this.connection.encrypt,
      this.connection.trustServerCertificate
    ];

    const parameters = {
      args,
      infoFile,
      outputFile,
      name: this.connection.name,
      env: {
        platform: Platform.MSSQL,
        sshEnabled: this.connection.sshEnabled,
        sslEnabled: this.connection.sslEnabled,
        sslRejectUnauthorized: this.connection.sslRejectUnauthorized,
        includeSchema: this.connection.includeSchema,
        parseData: this.connection.parseData
      }
    };

    return new ChildProcessExecutor(
      parameters,
      this.payloadProcessor,
      path.join(__dirname, "mssql-reverse-child-process.js"),
      () => {
        // This is intentional
      }
    );
  }
}

module.exports = MSSQLReverseExecutorBuilder;
