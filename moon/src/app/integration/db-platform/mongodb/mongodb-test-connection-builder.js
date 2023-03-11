const { ChildProcessExecutor } = require("electron-app");
const { Platform } = require("re");
const path = require("path");

class MongoDbTestConnectionExecutorBuilder {
  constructor(connection, filenameProvider, payloadProcessor) {
    this.connection = connection;
    this.filenameProvider = filenameProvider;
    this.payloadProcessor = payloadProcessor;
  }

  build() {
    const infoFile = this.filenameProvider.buildFilename("mongodbinfo");

    const args = [
      this.connection.url,
      infoFile,
      this.connection.sshEnabled,
      this.connection.sshhost ? this.connection.sshhost : "",
      this.connection.sshport ? this.connection.sshport : "",
      this.connection.sshusername ? this.connection.sshusername : "",
      this.connection.sshpassword ? this.connection.sshpassword : "",
      this.connection.sshprivatekey ? this.connection.sshprivatekey : "",
      this.connection.sshpassphrase ? this.connection.sshpassphrase : "",
      this.connection.authtype ? this.connection.authtype : "",
      this.connection.authsource ? this.connection.authsource : "",
      this.connection.authuser ? this.connection.authuser : "",
      this.connection.authpassword ? this.connection.authpassword : "",
      this.connection.tlsEnabled,
      this.connection.tlsCAFile ? this.connection.tlsCAFile : "",
      this.connection.tlsCertificateKeyFile
        ? this.connection.tlsCertificateKeyFile
        : "",
      this.connection.tlsCertificateKeyFilePassword
        ? this.connection.tlsCertificateKeyFilePassword
        : "",
      this.connection.tlsAllowInvalidHostnames ?? false,
      this.connection.directConnection ?? false,
      this.connection.retryWrites ?? false
    ];

    const parameters = {
      args,
      infoFile,
      name: this.connection.name,
      env: {
        platform: Platform.MONGODB,
        authtype: this.connection.authtype,
        sshEnabled: this.connection.sshEnabled,
        tlsEnabled: this.connection.tlsEnabled
      }
    };

    return new ChildProcessExecutor(
      parameters,
      this.payloadProcessor,
      path.join(__dirname, "mongodb-test-connection-child-process.js"),
      () => {
        // This is intentional
      }
    );
  }
}

module.exports = MongoDbTestConnectionExecutorBuilder;
