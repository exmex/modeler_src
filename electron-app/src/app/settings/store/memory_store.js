const Store = require("./store");

class MemoryStore extends Store {
  constructor(name) {
    super(name);
  }

  async load() {
    // console.dir({ MemoryStore_load: this.content });
    this.afterChange();
  }

  save(content) {
    this.setContent(content);
    this.afterChange();
  }
}

module.exports = MemoryStore;
