const Store = require("./store");
const fs = require("fs");
const { exists } = require("../../util/fs-advanced");

const UTF8_ENCODING = "utf8";

class UnencryptedFileStore extends Store {
  constructor(name, filename) {
    super(name);
    this.filename = filename;
  }

  async load() {
    if (await exists(this.filename)) {
      try {
        const textFileContent = (
          await fs.promises.readFile(this.filename, UTF8_ENCODING)
        ).toString();
        this.setContent(
          this.upgradeSettings(
            this.updateDefaultValues(JSON.parse(textFileContent))
          )
        );
        this.afterChange();
      } catch (e) {
        this.error(`Store ${this.name} cannot be loaded!`);
      }
    }
  }

  updateDefaultValues(content) {
    return content;
  }

  upgradeSettings(content) {
    return content;
  }

  async save(content) {
    try {
      const contentText = JSON.stringify(content, null, 2);
      await fs.promises.writeFile(this.filename, contentText);
      this.setContent(content);
      this.afterChange();
    } catch (e) {
      console.log({ e });
      this.error(`Store ${this.name} cannot be saved!`);
    }
  }
}

module.exports = UnencryptedFileStore;
