const { describe, beforeAll, afterAll, expect } = require("@jest/globals");
const EncryptedFileStore = require("../encrypted_file_store");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

describe("[Unit] Encrypted File Store", () => {
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
    const storeSave = new EncryptedFileStore("store", filename);
    const content = { a: "b" };
    storeSave.save(content);

    const storeLoad = new EncryptedFileStore("store", filename);
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

  it("should store encrypted data", async () => {
    // given
    const filename = path.join(testFolder, uuidv4());
    const storeSave = new EncryptedFileStore("store", filename);
    const content = { a: "b" };
    await storeSave.save(content);

    // when
    const loadedContent = fs.readFileSync(filename).toString();

    // then
    expect(loadedContent).not.toEqual(JSON.stringify(content, null, 2));
  });
});
