class CancelErrorExecutor {
  constructor(processor, done) {
    this.processor = processor;
    this.done = done;
  }

  execute() {
    this.processor.sendCancel();
    this.done();
  }
}

module.exports = CancelErrorExecutor;
