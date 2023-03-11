const _ = require("lodash");
const UnencryptedFileStore = require("./unencrypted_file_store");
const BackupModelTime = require("../backup_model_time");
const { app } = require("electron");

const DOCUMENTS_FOLDER = "documents";

class SettingsUnencryptedFileStore extends UnencryptedFileStore {
  async save(content) {
    await super.save(_.omit(content, "proxy"));
  }

  updateDefaultValues(content) {
    const upgradedContent = {
      defaultPath: app.getPath(DOCUMENTS_FOLDER),
      backupModelTime: BackupModelTime.FIVE_SECONDS,
      showTips: true,
      ...content
    };
    return upgradedContent;
  }

  upgradeSettings(content) {
    return {
      ...content,
      backupModelTime: this.upgradeBackupModelTime(content.backupModelTime)
    };
  }

  upgradeBackupModelTime(backupModelTime) {
    switch (backupModelTime) {
      case 0:
      case "0":
        return BackupModelTime.NEVER;
      case 1:
      case "1":
        return BackupModelTime.MINUTE;
      case 5:
      case "5":
        return BackupModelTime.FIVE_MINUTES;
      default:
        return backupModelTime;
    }
  }
}

module.exports = SettingsUnencryptedFileStore;
