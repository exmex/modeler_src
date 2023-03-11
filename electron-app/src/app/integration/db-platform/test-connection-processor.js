const PayloadProcessor = require("../payload-processor");

class TestConnectionProcessor extends PayloadProcessor {
  messageId() {
    return "connectionsList:testAndLoadCompleted";
  }
}

module.exports = TestConnectionProcessor;
