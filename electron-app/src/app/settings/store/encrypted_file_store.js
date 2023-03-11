const fs = require("fs");
const { encrypt, decrypt, oldDecrypt } = require("../../encrypt/encrypt");
const Store = require("./store");

const UTF8_ENCODING = "utf8";

class EncryptedFileStore extends Store {
  constructor(name, filename) {
    super(name);
    this.filename = filename;
  }

  async load() {
    await this.loadEncryptedFile();
  }

  async loadEncryptedFile() {
    try {
      const encryptedContentText = (
        await fs.promises.readFile(this.filename, UTF8_ENCODING)
      ).toString();
      const contentText = decrypt(encryptedContentText);

      const content = JSON.parse(contentText);
      this.setContent(this.updateDefaultValues(content));
      this.afterChange();
    } catch (e) {
      console.log(e);
      this.loadOldEncryptedFile();
    }
  }

  async loadOldEncryptedFile() {
    try {
      const encryptedContentText = (
        await fs.promises.readFile(this.filename, UTF8_ENCODING)
      ).toString();
      const contentText = oldDecrypt(encryptedContentText);
      const content = JSON.parse(contentText);
      await this.save(content);
    } catch (e) {
      this.error(`Store ${this.name} cannot be loaded!`);
    }
  }

  updateDefaultValues(content) {
    return content;
  }

  async save(content) {
    try {
      const contentText = JSON.stringify(content, null, 2);
      const encryptedContent = encrypt(contentText);
      await fs.promises.writeFile(this.filename, encryptedContent);
      this.setContent(content);
      this.afterChange();
    } catch (e) {
      this.error(`Store ${this.name} cannot be saved!`);
    }
  }
}

module.exports = EncryptedFileStore;
