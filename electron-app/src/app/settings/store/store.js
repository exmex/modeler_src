class Store {
  content = {};
  afterChangeListeners = [];
  errorListeners = [];

  constructor(name) {
    this.name = name;
    this.changeTimestamp = new Date();
  }

  getName() {
    return this.name;
  }

  addAfterChangeListener(listener) {
    this.afterChangeListeners.push(listener);
  }

  addErrorListener(listener) {
    this.errorListeners.push(listener);
  }

  afterChange() {
    this.afterChangeListeners.forEach((listener) => {
      listener.afterChange({ name: this.name, content: this.content });
    });
  }

  error(error) {
    this.errorListeners.forEach((listener) =>
      listener.error({ error, name: this.name })
    );
  }

  async load() {}

  async save(content) {}

  getContent() {
    return this.content;
  }

  setContent(content) {
    // console.dir(
    //   { Store_setContent: { name: this.name, content } },
    //   { depth: 10 }
    // );
    this.content = content;
    this.changeTimestamp = new Date();
  }

  close() {}
}

module.exports = Store;
