const Store = require("./store");
const fs = require("fs");
const moment = require("moment");
const { exists } = require("../../util/fs-advanced");

class AppLifespanStore extends Store {
  constructor(name, filename) {
    super(name);
    this.filename = filename;
  }

  getEncryptedNow() {
    const today = new Date();
    let tomorrow = new Date();
    tomorrow = tomorrow.setDate(today.getDate() - 1);
    return moment(tomorrow).unix() + "963";
  }

  async load() {
    if (await exists(this.filename)) {
      await this.loadContent();
    } else {
      await this.save(this.getEncryptedNow());
    }
  }

  async loadContent() {
    try {
      const encryptedContentText = (
        await fs.promises.readFile(this.filename)
      ).toString();
      const content = this.decryptContent(encryptedContentText);
      this.setContent(content);
      this.afterChange();
    } catch (e) {
      this.error(`Store ${this.name} cannot be loaded!`);
    }
  }

  decryptContent(encryptedContent) {
    return encryptedContent.substring(0, encryptedContent.length - 3);
  }

  updateDefaultValues(content) {
    return content;
  }

  upgradeSettings(content) {
    return content;
  }

  async save(encryptedContent) {
    if (await exists(this.filename)) {
      this.loadContent();
    } else {
      await this.saveContent(encryptedContent);
    }
  }

  async saveContent(encryptedContent) {
    try {
      await fs.promises.writeFile(this.filename, encryptedContent);
      this.setContent(this.decryptContent(encryptedContent));
      this.afterChange();
    } catch (e) {
      this.error(`Store ${this.name} cannot be saved!`);
    }
  }
}

module.exports = AppLifespanStore;
