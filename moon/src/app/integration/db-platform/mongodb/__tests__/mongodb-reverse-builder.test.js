const os = require("os");

const MongoDbReverseExecutorBuilder = require("../mongodb-reverse-builder");
const FilenameProvider = require("../../../filename-provider");
const PayloadProcessor = require("../../../payload-processor");

const limitIndex = 15;

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
    source: "source",
    noLimit: true,
    dataLimit: -1,
    referenceSearch: "first",
    tlsEnabled: true,
    tlsCAFile: "tlsCAFile",
    tlsCertificateKeyFile: "tlsCertificateKeyFile",
    tlsCertificateKeyFilePassword: "tlsCertificateKeyFilePassword"
  };
  const filenameProvider = new FilenameProvider(os.tmpdir());
  const payloadProcessor = new PayloadProcessor();
  const builder = new MongoDbReverseExecutorBuilder(
    connection,
    filenameProvider,
    payloadProcessor
  );

  //when
  const result = builder.build();

  //then
  expect(result.parameters.args[0]).toEqual("url");
  expect(result.parameters.args[1]).toEqual("database");
  expect(result.parameters.args[2]).toBeDefined();
  expect(result.parameters.args[3]).toBeDefined();
  expect(result.parameters.args[4]).toEqual("sshEnabled");
  expect(result.parameters.args[5]).toEqual("sshhost");
  expect(result.parameters.args[6]).toEqual("sshport");
  expect(result.parameters.args[7]).toEqual("sshusername");
  expect(result.parameters.args[8]).toEqual("sshpassword");
  expect(result.parameters.args[9]).toEqual("sshprivatekey");
  expect(result.parameters.args[10]).toEqual("sshpassphrase");
  expect(result.parameters.args[11]).toEqual("authtype");
  expect(result.parameters.args[12]).toEqual("authsource");
  expect(result.parameters.args[13]).toEqual("authuser");
  expect(result.parameters.args[14]).toEqual("authpassword");
  expect(result.parameters.args[limitIndex]).toEqual(0);
  expect(result.parameters.args[16]).toEqual("source");
  expect(result.parameters.args[17]).toEqual("first");
  expect(result.parameters.args[18]).toEqual(true);
  expect(result.parameters.args[19]).toEqual("tlsCAFile");
  expect(result.parameters.args[20]).toEqual("tlsCertificateKeyFile");
  expect(result.parameters.args[21]).toEqual("tlsCertificateKeyFilePassword");
});

it("should return correct parameters", () => {
  //given
  const connection = {
    noLimit: false,
    dataLimit: 1000
  };
  const filenameProvider = new FilenameProvider(os.tmpdir());
  const payloadProcessor = new PayloadProcessor();
  const builder = new MongoDbReverseExecutorBuilder(
    connection,
    filenameProvider,
    payloadProcessor
  );

  //when
  const result = builder.build();

  //then
  expect(result.parameters.args[limitIndex]).toEqual(1000);
});
