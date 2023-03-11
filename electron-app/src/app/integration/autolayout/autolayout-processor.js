const PayloadProcessor = require("../payload-processor");

class AutolayoutProcessor extends PayloadProcessor {
  messageId() {
    return "model:autolayoutCompleted";
  }
}

module.exports = AutolayoutProcessor;
