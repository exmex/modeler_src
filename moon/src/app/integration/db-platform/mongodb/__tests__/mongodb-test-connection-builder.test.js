const os = require("os");

const MongoDbTestConnectionBuilder = require("../mongodb-test-connection-builder");
const FilenameProvider = require("../../../filename-provider");
const PayloadProcessor = require("../../../payload-processor");

it("should return correct parameters", () => {
  //given
  const connection = {
    url: "url",
    database: "database",
    sshEnabled: "sshEnabled",
    sshhost: "sshhost",
    sshport: "sshport",
    sshusername: "sshusername",
    sshpassword: "sshpassword",
    sshprivatekey: "sshprivatekey",
    sshpassphrase: "sshpassphrase",
    authtype: "authtype",
    authsource: "authsource",
    authuser: "authuser",
    authpassword: "authpassword",
    tlsEnabled: "true",
    tlsCAFile: "tlsCAFile",
    tlsCertificateKeyFile: "tlsCertificateKeyFile",
    tlsCertificateKeyFilePassword: "tlsCertificateKeyFilePassword"
  };
  const filenameProvider = new FilenameProvider(os.tmpdir());
  const payloadProcessor = new PayloadProcessor();
  const builder = new MongoDbTestConnectionBuilder(
    connection,
    filenameProvider,
    payloadProcessor
  );

  //when
  const result = builder.build();

  //then
  expect(result.parameters.args[0]).toEqual("url");
  expect(result.parameters.args[1]).toBeDefined();
  expect(result.parameters.args[2]).toEqual("sshEnabled");
  expect(result.parameters.args[3]).toEqual("sshhost");
  expect(result.parameters.args[4]).toEqual("sshport");
  expect(result.parameters.args[5]).toEqual("sshusername");
  expect(result.parameters.args[6]).toEqual("sshpassword");
  expect(result.parameters.args[7]).toEqual("sshprivatekey");
  expect(result.parameters.args[8]).toEqual("sshpassphrase");
  expect(result.parameters.args[9]).toEqual("authtype");
  expect(result.parameters.args[10]).toEqual("authsource");
  expect(result.parameters.args[11]).toEqual("authuser");
  expect(result.parameters.args[12]).toEqual("authpassword");
  expect(result.parameters.args[13]).toEqual("true");
  expect(result.parameters.args[14]).toEqual("tlsCAFile");
  expect(result.parameters.args[15]).toEqual("tlsCertificateKeyFile");
  expect(result.parameters.args[16]).toEqual("tlsCertificateKeyFilePassword");
});
