const Dispatcher = require("../dispatcher");

describe("Dispatcher", () => {
  let webContents;
  let spySend;
  beforeAll(() => {
    webContents = { send: () => {} };
    spySend = jest.spyOn(webContents, "send");
  });
  it("should generate unique filename with type def", () => {
    // given
    const dispatcher = new Dispatcher(webContents);
    const messageId = "MessageId";
    const err = new Error();

    // when
    dispatcher.sendError(messageId, err);

    // then
    expect(spySend).toBeCalledWith("notification:newMessage", {
      type: "error",
      message: messageId,
      full: err
    });
  });

  it("should generate unique filename with type def", () => {
    // given
    const dispatcher = new Dispatcher(webContents);
    const messageId = "MessageId";
    const payload = { test: "test" };

    // when
    dispatcher.send(messageId, payload);

    // then
    expect(spySend).toBeCalledWith(messageId, payload);
  });

  afterAll(() => {
    spySend.mockReset();
    spySend.mockRestore();
  });
});
