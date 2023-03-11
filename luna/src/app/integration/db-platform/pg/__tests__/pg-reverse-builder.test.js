const os = require("os");

const PostgresReverseExecutorBuilder = require("../pg-reverse-builder");
const FilenameProvider = require("../../../filename-provider");
const PayloadProcessor = require("../../../payload-processor");

const limitIndex = 15;

it("should return correct parameters", () => {
  //given
  const connection = {
    server: "server",
    port: "port",
    database: "schema",
    db: "db",
    user: "user",
    password: "password",
    sshEnabled: "sshEnabled",
    sshhost: "sshhost",
    sshport: "sshport",
    sshusername: "sshusername",
    sshpassword: "sshpassword",
    sshprivatekey: "sshprivatekey",
    sshpassphrase: "sshpassphrase",
    includeSchema: true,
    parseData: false,
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
  const builder = new PostgresReverseExecutorBuilder(
    connection,
    filenameProvider,
    payloadProcessor
  );

  //when
  const result = builder.build();

  //then
  expect(result.parameters.args[0]).toBeDefined();
  expect(result.parameters.args[1]).toEqual("server:port");
  expect(result.parameters.args[2]).toEqual("db");
  expect(result.parameters.args[3]).toEqual("schema");
  expect(result.parameters.args[4]).toEqual("user");
  expect(result.parameters.args[5]).toEqual("password");
  expect(result.parameters.args[6]).toBeDefined();
  expect(result.parameters.args[7]).toEqual("sshEnabled");
  expect(result.parameters.args[8]).toEqual("sshhost");
  expect(result.parameters.args[9]).toEqual("sshport");
  expect(result.parameters.args[10]).toEqual("sshusername");
  expect(result.parameters.args[11]).toEqual("sshpassword");
  expect(result.parameters.args[12]).toEqual("sshprivatekey");
  expect(result.parameters.args[13]).toEqual("sshpassphrase");
  expect(result.parameters.args[14]).toEqual(true);
  expect(result.parameters.args[limitIndex]).toEqual(-1);
  expect(result.parameters.args[16]).toEqual("sslEnabled");
  expect(result.parameters.args[17]).toEqual("sslRejectUnauthorized");
  expect(result.parameters.args[18]).toEqual("sslCA");
  expect(result.parameters.args[19]).toEqual("sslCert");
  expect(result.parameters.args[20]).toEqual("sslKey");
  expect(result.parameters.args[21]).toEqual("sslPassPhrase");
  expect(result.parameters.args[22]).toEqual("sslServerName");
});

it("should return correct ssh parameters", () => {
  //given
  const connection = {
    sshEnabled: "sshEnabled",
    sshhost: "sshhost",
    sshport: "sshport",
    sshusername: "sshusername",
    sshpassword: "sshpassword",
    sshprivatekey: "sshprivatekey",
    sshpassphrase: "sshpassphrase",
    includeSchema: true
  };
  const filenameProvider = new FilenameProvider(os.tmpdir());
  const payloadProcessor = new PayloadProcessor();
  const builder = new PostgresReverseExecutorBuilder(
    connection,
    filenameProvider,
    payloadProcessor
  );

  //when
  const result = builder.build();

  //then
  expect(result.parameters.args[7]).toEqual("sshEnabled");
  expect(result.parameters.args[8]).toEqual("sshhost");
  expect(result.parameters.args[9]).toEqual("sshport");
  expect(result.parameters.args[10]).toEqual("sshusername");
  expect(result.parameters.args[11]).toEqual("sshpassword");
  expect(result.parameters.args[12]).toEqual("sshprivatekey");
  expect(result.parameters.args[13]).toEqual("sshpassphrase");
  expect(result.parameters.args[14]).toEqual(true);
});

it("should return no JSON parsing parameters", () => {
  //given
  const connection = {
    parseData: false,
    noLimit: true,
    dataLimit: -1
  };
  const filenameProvider = new FilenameProvider(os.tmpdir());
  const payloadProcessor = new PayloadProcessor();
  const builder = new PostgresReverseExecutorBuilder(
    connection,
    filenameProvider,
    payloadProcessor
  );

  //when
  const result = builder.build();

  //then
  expect(result.parameters.args[limitIndex]).toEqual(-1);
});

it("should return JSON all rows parsing parameters", () => {
  //given
  const connection = {
    parseData: true,
    noLimit: true,
    dataLimit: -1
  };
  const filenameProvider = new FilenameProvider(os.tmpdir());
  const payloadProcessor = new PayloadProcessor();
  const builder = new PostgresReverseExecutorBuilder(
    connection,
    filenameProvider,
    payloadProcessor
  );

  //when
  const result = builder.build();

  //then
  expect(result.parameters.args[limitIndex]).toEqual(0);
});

it("should return JSON one row parsing parameters", () => {
  //given
  const connection = {
    parseData: true,
    noLimit: false,
    dataLimit: 1
  };
  const filenameProvider = new FilenameProvider(os.tmpdir());
  const payloadProcessor = new PayloadProcessor();
  const builder = new PostgresReverseExecutorBuilder(
    connection,
    filenameProvider,
    payloadProcessor
  );

  //when
  const result = builder.build();

  //then
  expect(result.parameters.args[limitIndex]).toEqual(1);
});

it("should return JSON parsing (no initialization) parameters", () => {
  //given
  const connection = {};
  const filenameProvider = new FilenameProvider(os.tmpdir());
  const payloadProcessor = new PayloadProcessor();
  const builder = new PostgresReverseExecutorBuilder(
    connection,
    filenameProvider,
    payloadProcessor
  );

  //when
  const result = builder.build();

  //then
  expect(result.parameters.args[limitIndex]).toEqual(undefined);
});
