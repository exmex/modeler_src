class PayloadProcessor {
  constructor(dispatcher) {
    this.dispatcher = dispatcher;
    this.messageId = this.messageId.bind(this);
    this.progressMessageId = this.progressMessageId.bind(this);
    this.processOutput = this.processOutput.bind(this);
    this.processError = this.processError.bind(this);
    this.sendCancel = this.sendCancel.bind(this);
    this.sendError = this.sendError.bind(this);
    this.sendInternalError = this.sendInternalError.bind(this);
    this.sendSuccessInfo = this.sendSuccessInfo.bind(this);
    this.sendProgress = this.sendProgress.bind(this);
    this.sendSuccessOutput = this.sendSuccessOutput.bind(this);
  }

  messageId() {
    return "";
  }

  progressMessageId() {
    return "";
  }

  processOutput(output) {
    return output;
  }

  processError(error, internal, cancel) {
    return { error: error.message, stack: error.stack, internal, cancel };
  }

  sendCancel() {
    this.dispatcher.send(
      this.messageId(),
      this.processError(new Error(), false, true)
    );
  }

  sendError(error) {
    this.dispatcher.send(
      this.messageId(),
      this.processError(error, false, false)
    );
  }

  sendInternalError(error) {
    this.dispatcher.send(
      this.messageId(),
      this.processError(error, true, false)
    );
  }

  sendSuccessInfo(info) {
    this.dispatcher.send(this.messageId(), info);
  }

  sendProgress(progress) {
    this.dispatcher.send(this.progressMessageId(), progress);
  }

  sendSuccessOutput(output) {
    this.dispatcher.send(this.messageId(), this.processOutput(output));
  }
}

module.exports = PayloadProcessor;
