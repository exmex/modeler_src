const PayloadProcessor = require("../payload-processor");

class ReverseProcessor extends PayloadProcessor {
  constructor(dispatcher) {
    super(dispatcher);
    this.messageId = this.messageId.bind(this);
    this.progressMessageId = this.progressMessageId.bind(this);
    this.processOutput = this.processOutput.bind(this);
  }

  messageId() {
    return "model:reverseCompleted";
  }

  progressMessageId() {
    return "model:reverseProgress";
  }

  processOutput(payload) {
    return { modelData: payload, filePath: "", lastSaveDay: "", isDirty: true };
  }
}

module.exports = ReverseProcessor;
