const AutolayoutProcessor = require("../autolayout-processor");

it("should return messageId - model:autolayoutCompleted", () => {
  // given
  const processor = new AutolayoutProcessor();

  // when
  const result = processor.messageId();

  // then
  expect(result).toEqual("model:autolayoutCompleted");
});
