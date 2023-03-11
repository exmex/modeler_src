const TestConnectionProcessor = require("../test-connection-processor");

it("should return messageId - connectionsList:testAndLoadCompleted", () => {
  // given
  const testConnectionProcessor = new TestConnectionProcessor();

  // when
  const result = testConnectionProcessor.messageId();

  // then
  expect(result).toEqual("connectionsList:testAndLoadCompleted");
});
