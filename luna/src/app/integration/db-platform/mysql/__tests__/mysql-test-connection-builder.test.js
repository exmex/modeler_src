const os = require("os");

const MySQLTestConnectionExecutorBuilder = require("../mysql-test-connection-builder");
const FilenameProvider = require("../../../filename-provider");
const PayloadProcessor = require("../../../payload-processor");

it("should return correct parameters", () => {
  //given
  const connection = {
    server: "server",
    port: "port",
    user: "user",
    password: "password",
    sshEnabled: "sshEnabled",
    sshhost: "sshhost",
    sshport: "sshport",
    sshusername: "sshusername",
    sshpassword: "sshpassword",
    sshprivatekey: "sshprivatekey",
    sshpassphrase: "sshpassphrase",
    sslEnabled: "sslEnabled",
    sslRejectUnauthorized: "sslRejectUnauthorized",
    sslCA: "sslCA",
    sslCert: "sslCert",
    sslKey: "sslKey",
    sslPassPhrase: "sslPassPhrase",
    sslServerName: "sslServerName"
  };
  const filenameProvider = new FilenameProvider(os.tmpdir());
  const payloadProcessor = new PayloadProcessor();
  const builder = new MySQLTestConnectionExecutorBuilder(
    connection,
    filenameProvider,
    payloadProcessor
  );

  //when
  const result = builder.build();

  //then
  expect(result.parameters.args[0]).toEqual("server:port");
  expect(result.parameters.args[1]).toEqual("user");
  expect(result.parameters.args[2]).toEqual("password");
  expect(result.parameters.args[3]).toBeDefined();
  expect(result.parameters.args[4]).toEqual("sshEnabled");
  expect(result.parameters.args[5]).toEqual("sshhost");
  expect(result.parameters.args[6]).toEqual("sshport");
  expect(result.parameters.args[7]).toEqual("sshusername");
  expect(result.parameters.args[8]).toEqual("sshpassword");
  expect(result.parameters.args[9]).toEqual("sshprivatekey");
  expect(result.parameters.args[10]).toEqual("sshpassphrase");
  expect(result.parameters.args[11]).toEqual("sslEnabled");
  expect(result.parameters.args[12]).toEqual("sslRejectUnauthorized");
  expect(result.parameters.args[13]).toEqual("sslCA");
  expect(result.parameters.args[14]).toEqual("sslCert");
  expect(result.parameters.args[15]).toEqual("sslKey");
  expect(result.parameters.args[16]).toEqual("sslPassPhrase");
  expect(result.parameters.args[17]).toEqual("sslServerName");
});
