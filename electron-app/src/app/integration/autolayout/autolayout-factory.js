const ChildProcessorExecutor = require("../child-process-executor");
const fs = require("fs").promises;
const path = require("path");

class AutolayoutFactory {
  constructor(filenameProvider, payloadProcessor) {
    this.filenameProvider = filenameProvider;
    this.payloadProcessor = payloadProcessor;
  }

  async createAutolayoutExecutor({
    model,
    layoutType,
    autosize,
    expandNested,
    diagramId
  }) {
    const inputFile = this.filenameProvider.buildFilename("al-in-");
    const outputFile = this.filenameProvider.buildFilename("al-out-");

    await fs.writeFile(inputFile, model);

    var args = [
      inputFile,
      outputFile,
      layoutType,
      autosize,
      expandNested,
      diagramId
    ];

    const parameters = {
      args,
      inputFile,
      outputFile
    };

    return new ChildProcessorExecutor(
      parameters,
      this.payloadProcessor,
      path.join(__dirname, "autolayout-child-process.js"),
      () => {
        // This is intentional - for testing purposes
      }
    );
  }
}

module.exports = AutolayoutFactory;
