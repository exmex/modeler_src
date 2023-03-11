const { ChildProcessExecutor } = require("electron-app");
const { Platform } = require("re");
const path = require("path");

class MySQLTestConnectionExecutorBuilder {
  constructor(connection, filenameProvider, payloadProcessor) {
    this.connection = connection;
    this.filenameProvider = filenameProvider;
    this.payloadProcessor = payloadProcessor;
  }

  build() {
    const infoFile = this.filenameProvider.buildFilename("mysqlinfo");
    const args = [
      this.connection.server + ":" + this.connection.port,
      this.connection.user ? this.connection.user : "",
      this.connection.password ? this.connection.password : "",
      infoFile,
      this.connection.sshEnabled,
      this.connection.sshhost ? this.connection.sshhost : "",
      this.connection.sshport ? this.connection.sshport : "",
      this.connection.sshusername ? this.connection.sshusername : "",
      this.connection.sshpassword ? this.connection.sshpassword : "",
      this.connection.sshprivatekey ? this.connection.sshprivatekey : "",
      this.connection.sshpassphrase ? this.connection.sshpassphrase : "",
      this.connection.sslEnabled,
      this.connection.sslRejectUnauthorized,
      this.connection.sslCA ? this.connection.sslCA : "",
      this.connection.sslCert ? this.connection.sslCert : "",
      this.connection.sslKey ? this.connection.sslKey : "",
      this.connection.sslPassPhrase ? this.connection.sslPassPhrase : "",
      this.connection.sslServerName ? this.connection.sslServerName : "",
    ];

    const parameters = {
      args,
      infoFile,
      name: this.connection.name,
      env: {
        platform: Platform.MYSQL,
        sshEnabled: this.connection.sshEnabled,
        sslEnabled: this.connection.sslEnabled,
        sslRejectUnauthorized: this.connection.sslRejectUnauthorized,
      },
    };

    return new ChildProcessExecutor(
      parameters,
      this.payloadProcessor,
      path.join(__dirname, "mysql-test-connection-child-process.js"),
      () => {
        // This is intentional
      }
    );
  }
}

module.exports = MySQLTestConnectionExecutorBuilder;
