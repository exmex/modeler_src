const FilenameProvider = require("../filename-provider");
const path = require("path");
const os = require("os");

it("should generate unique filename with type def", () => {
  // given
  const fp = new FilenameProvider(os.tmpdir());

  // when
  const result = fp.buildFilename("type");

  // then
  const tmpTypeDir = path.join(os.tmpdir(), "type");
  expect(result.substr(0, tmpTypeDir.length)).toEqual(tmpTypeDir);
  expect(result.substr(result.length - 5, 5)).toEqual(".json");
});
