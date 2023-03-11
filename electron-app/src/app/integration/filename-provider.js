const path = require("path");
const { v4: uuidv4 } = require("uuid");

class FilenameProvider {
  constructor(tmpdir) {
    this.tmpdir = tmpdir;
  }

  buildFilename(type) {
    return path.join(this.tmpdir, type + uuidv4() + ".json");
  }
}

module.exports = FilenameProvider;
