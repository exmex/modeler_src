const _ = require("lodash");

const EncryptedFileStore = require("./encrypted_file_store");

class SettingsEncryptedFileStore extends EncryptedFileStore {
  async save(content) {
    await super.save({ proxy: content.proxy });
  }

  updateDefaultValues(content) {
    return {
      proxy: {
        enabled: false,
        url: "",
        port: "",
        user: "",
        password: ""
      },
      ...content
    };
  }
}

module.exports = SettingsEncryptedFileStore;
