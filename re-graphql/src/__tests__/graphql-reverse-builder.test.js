const os = require("os");

const FilenameProvider = require("../../../filename-provider");
const PayloadProcessor = require("../../../payload-processor");
const GraphQLReverseExecutorBuilder = require("../graphql-reverse-builder");

it("should return correct parameters", () => {
  //given
  const connection = {
    sourceType: "sourceType",
    source: "source",
  };
  const filenameProvider = new FilenameProvider(os.tmpdir());
  const payloadProcessor = new PayloadProcessor();
  const builder = new GraphQLReverseExecutorBuilder(
    connection,
    filenameProvider,
    payloadProcessor
  );

  //when
  const result = builder.build();

  //then
  expect(result.parameters.args[0]).toEqual("sourceType");
  expect(result.parameters.args[1]).toEqual("source");
  expect(result.parameters.args[2]).toBeDefined();
  expect(result.parameters.args[3]).toBeDefined();
});

it("should return error executor on empty schemaFilename", () => {
  //given
  const connection = {
    schemaFilename: undefined,
  };
  const filenameProvider = new FilenameProvider(os.tmpdir());
  const payloadProcessor = new PayloadProcessor();
  const builder = new GraphQLReverseExecutorBuilder(
    connection,
    filenameProvider,
    payloadProcessor
  );

  //when
  const result = builder.build();

  //then
  expect(result.constructor.name).toEqual("CancelErrorExecutor");
});
