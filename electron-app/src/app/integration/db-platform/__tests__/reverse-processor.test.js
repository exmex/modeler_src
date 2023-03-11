const ReverseProcessor = require("../reverse-processor");
const Dispatcher = require("../../dispatcher");

it("should return messageId - model:reverseCompleted", () => {
  // given
  const processor = new ReverseProcessor();

  // when
  const result = processor.messageId();

  // then
  expect(result).toEqual("model:reverseCompleted");
});

it("should return errorMessage - Test connection failed. Message", () => {
  // given
  const processor = new ReverseProcessor();

  // when
  const result = processor.processOutput({ data: "text" });

  // then
  expect(result).toEqual({
    modelData: { data: "text" },
    filePath: "",
    lastSaveDay: "",
    isDirty: true
  });
});

describe("Sending events", () => {
  let spySend;
  let processor;

  beforeAll(() => {
    const webcontents = { send: () => {} };
    const dispatcher = new Dispatcher(webcontents);
    spySend = jest.spyOn(dispatcher, "send");
    processor = new ReverseProcessor(dispatcher);
  });

  it("should dispath message on sendError", () => {
    // given
    const e = new Error("Message");
    e.stack = "stacktrace";

    // when
    processor.sendError(e);

    // then
    expect(spySend).toBeCalledWith("model:reverseCompleted", {
      cancel: false,
      error: "Message",
      internal: false,
      stack: "stacktrace"
    });
  });

  it("should dispath message on sendInternalError", () => {
    // given
    const message = `text`;
    const e = new Error(message);
    e.stack = "stacktrace";

    // when
    processor.sendInternalError(e);

    // then
    expect(spySend).toBeCalledWith("model:reverseCompleted", {
      cancel: false,
      error: "text",
      internal: true,
      stack: "stacktrace"
    });
  });

  it("should dispath message on sendSuccessInfo", () => {
    // given
    const info = { info: "text" };

    // when
    processor.sendSuccessInfo(info);

    // then
    expect(spySend).toBeCalledWith("model:reverseCompleted", { info: "text" });
  });

  it("should dispath message on sendSuccessOutput", () => {
    // given
    const output = { output: "text" };

    // when
    processor.sendSuccessOutput(output);

    // then
    expect(spySend).toBeCalledWith("model:reverseCompleted", {
      modelData: { output: "text" },
      filePath: "",
      lastSaveDay: "",
      isDirty: true
    });
  });

  afterAll(() => {
    spySend.mockReset();
    spySend.mockRestore();
  });
});
