const IntegrationFactory = require("../integration-factory");

it("should return AutolayoutBuilder", () => {
  // given
  const factory = new IntegrationFactory();

  // when
  const result = factory.createAutolayoutFactory();

  // then
  expect(result.constructor.name).toEqual("AutolayoutFactory");
});

it.skip("should return DbPlatformFactory", () => {
  // given
  const factory = new IntegrationFactory();

  // when
  const result = factory.createDbPlatformFactoryCallback();

  // then
  expect(result.constructor.name).toEqual("DbPlatformFactory");
});
