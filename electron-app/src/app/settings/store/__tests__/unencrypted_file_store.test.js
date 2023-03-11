const { describe, beforeAll, afterAll, expect } = require("@jest/globals");
const UnencryptedFileStore = require("../unencrypted_file_store");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

describe("[Unit] Unencrypted File Store", () => {
  const testFolder = path.join(os.tmpdir(), "test-electron-app");
  beforeAll(() => {
    fs.mkdirSync(testFolder, {
      recursive: true
    });
  });

  afterAll(() => {
    try {
      fs.rmSync(testFolder, {
        recursive: true
      });
    } catch (e) {}
  });

  it("should store and load data", async () => {
    // given
    const filename = path.join(testFolder, uuidv4());
    const storeSave = new UnencryptedFileStore("store", filename);
    const content = { a: "b" };
    await storeSave.save(content);

    const storeLoad = new UnencryptedFileStore("store", filename);
    const listener = {
      afterChange({ name, content }) {
        this.name = name;
        this.content = content;
      }
    };
    storeLoad.addAfterChangeListener(listener);

    // when
    await storeLoad.load();

    // then
    expect(listener.name).toEqual("store");
    expect(listener.content).toEqual(content);
  });
});
