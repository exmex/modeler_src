const ChildProcessExecutor = require("../child-process-executor");
const Dispatcher = require("../dispatcher");
const TestConnectionProcessor = require("../db-platform/test-connection-processor");

const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const existsSync = require("fs").existsSync;
const os = require("os");
const path = require("path");

describe.skip("[integration] child-process-executor", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const generateFilename = (prefix) => {
    const filename = uuidv4();
    return path.join(os.tmpdir(), prefix + filename);
  };

  const createFile = (filename, content) => {
    const contentText = JSON.stringify(content);
    fs.writeFileSync(filename, contentText);
    return filename;
  };

  const executeExecutor = async (parameters, scriptName) => {
    await new Promise((resolve) => {
      const done = () => {
        resolve();
      };
      const executor = new ChildProcessExecutor(
        parameters,
        processor,
        scriptName,
        done
      );
      executor.execute();
    });
  };

  let processor;
  let spySendSuccessOutput;
  let spySendSuccessInfo;
  let spySendError;
  let spySendInternalError;

  beforeAll(() => {
    const dispatcher = new Dispatcher({
      send: () => {
        // This is intentional
      }
    });
    processor = new TestConnectionProcessor(dispatcher);
  });

  beforeEach(() => {
    spySendSuccessOutput = jest.spyOn(processor, "sendSuccessOutput");
    spySendSuccessInfo = jest.spyOn(processor, "sendSuccessInfo");
    spySendError = jest.spyOn(processor, "sendError");
    spySendInternalError = jest.spyOn(processor, "sendInternalError");
  });

  it("[cpe0] should send error messages if there is info or output", async () => {
    // given
    await executeExecutor({ args: [] }, undefined);
    // then
    expect(spySendError).toBeCalledWith(
      expect.objectContaining({
        message:
          'The "path" argument must be of type string. Received undefined'
      })
    );
  });

  it("[cpe1] should send error messages if there is info or output", async () => {
    // given
    await executeExecutor(
      { args: [] },
      "__mocks__/do-nothing-child-process.js"
    );
    // then
    expect(spySendError).toBeCalledWith(
      expect.objectContaining({
        message: `No info or output parameter defined.`
      })
    );
  });

  it("[cpe2] should send error messages if there should be only info and file is not on disk", async () => {
    // given
    const infoFile = generateFilename("cpe-2-");
    // when
    await executeExecutor(
      { infoFile, args: [] },
      "__mocks__/do-nothing-child-process.js"
    );
    // then
    expect(existsSync(infoFile)).toEqual(false);
    expect(spySendError).toBeCalledWith(
      expect.objectContaining({
        message: `ENOENT: no such file or directory, open '${infoFile}'`
      })
    );
  });

  it("[cpe3] should send info messages if there is only info with OK status", async () => {
    // given
    const infoFile = createFile(generateFilename("cpe-3-"), {
      input: "text",
      status: "ok"
    });
    // when
    await executeExecutor(
      { infoFile, args: [] },
      "__mocks__/do-nothing-child-process.js"
    );
    // then
    expect(existsSync(infoFile)).toEqual(false);
    expect(spySendSuccessInfo).toBeCalledWith({ input: "text", status: "ok" });
  });

  it("[cpe4] should send error messages if there should be only output and file is not on disk", async () => {
    // given
    const outputFile = generateFilename("cpe5-");
    // when
    await executeExecutor(
      { outputFile, args: [] },
      "__mocks__/do-nothing-child-process.js"
    );
    // then
    expect(existsSync(outputFile)).toEqual(false);
    expect(spySendError).toBeCalledWith(
      expect.objectContaining({
        message: `ENOENT: no such file or directory, open '${outputFile}'`
      })
    );
  });

  it("[cpe5] should send info messages if there is only output", async () => {
    // given
    const outputFile = await createFile(generateFilename("cpe-6-"), {
      output: "text"
    });
    // when
    await executeExecutor(
      { outputFile, args: [] },
      "__mocks__/do-nothing-child-process.js"
    );
    // then
    expect(existsSync(outputFile)).toEqual(false);
    expect(spySendSuccessOutput).toBeCalledWith({ output: "text" });
  });

  it("[cpe6] should send info messages if there is info, output with OK status", async () => {
    // given
    const infoFile = await createFile(generateFilename("cpe-7-info-"), {
      input: "text",
      status: "ok"
    });
    const outputFile = await createFile(generateFilename("cpe-7-out-"), {
      output: "text"
    });
    // when
    await executeExecutor(
      { infoFile, outputFile, args: [] },
      "__mocks__/do-nothing-child-process.js"
    );
    // then
    expect(existsSync(infoFile)).toEqual(false);
    expect(existsSync(outputFile)).toEqual(false);
    expect(spySendSuccessOutput).toBeCalledWith({ output: "text" });
  });

  it("[cpe7] should send info messages if there is input and output", async () => {
    // given
    const inputFile = await createFile(generateFilename("cpe-8-in-"), {
      input: "text",
      status: "ok"
    });
    const outputFile = await createFile(generateFilename("cpe-8-out-"), {
      output: "text"
    });
    // when
    await executeExecutor(
      { inputFile, outputFile, args: [] },
      "__mocks__/do-nothing-child-process.js"
    );
    // then
    expect(existsSync(inputFile)).toEqual(false);
    expect(existsSync(outputFile)).toEqual(false);
    expect(spySendSuccessOutput).toBeCalledWith({ output: "text" });
  });
  it("[cpe8] should send internal error messages if there is info with error status and internal cateory", async () => {
    // given
    const infoFile = await createFile(generateFilename("cpe-9-"), {
      input: "text",
      status: "error",
      message: "error",
      category: "INTERNAL"
    });
    // when
    await executeExecutor(
      { infoFile, args: [] },
      "__mocks__/do-nothing-child-process.js"
    );
    // then
    expect(existsSync(infoFile)).toEqual(false);
    const error = new Error(`error`);
    error.name = "INTERNAL";
    expect(spySendInternalError).toBeCalledWith(error);
  });

  it("[cpe9] should send error messages if there is info with error status, category internal", async () => {
    // given
    const infoFile = await createFile(generateFilename("cpe-10-"), {
      input: "text",
      status: "error",
      message: "error",
      stack: "stack",
      category: "INTERNAL"
    });
    // when
    await executeExecutor(
      { infoFile, args: [] },
      "__mocks__/do-nothing-child-process.js"
    );
    // then
    expect(existsSync(infoFile)).toEqual(false);
    const error = new Error(`error`);
    error.stack = "stack";
    expect(spySendInternalError).toBeCalledWith(error);
  });

  it("[cpe10] should send error messages if there is info with error status, category connection", async () => {
    // given
    const infoFile = await createFile(generateFilename("cpe-11-"), {
      input: "text",
      status: "error",
      message: "error",
      stack: "stack",
      category: "CONNECTION"
    });
    // when
    await executeExecutor(
      { infoFile, args: [] },
      "__mocks__/do-nothing-child-process.js"
    );
    // then
    expect(existsSync(infoFile)).toEqual(false);
    const error = new Error(`error`);
    error.stack = "stack";
    expect(spySendError).toBeCalledWith(error);
  });
  it("[cpe11] should send error messages if there is info with error status, no category", async () => {
    // given
    const infoFile = await createFile(generateFilename("cpe-11-"), {
      input: "text",
      status: "error",
      message: "error",
      stack: "stack"
    });
    // when
    await executeExecutor(
      { infoFile, args: [] },
      "__mocks__/do-nothing-child-process.js"
    );
    // then
    expect(existsSync(infoFile)).toEqual(false);
    const error = new Error(`error`);
    error.stack = "stack";
    expect(spySendError).toBeCalledWith(error);
  });
});
