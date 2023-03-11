const child_process = require("child_process");
const fs = require("fs").promises;

const ENCODING = "utf-8";
const OK_STATUS = "ok";

const CLOSE_EVENT = "close";
const DATA_EVENT = "data";
const MESSAGE_EVENT = "message1";

const NO_OUTPUT_MESSAGE = "No info or output parameter defined.";
const SIGKILL_SIGNAL = "SIGKILL";

const INTERNAL = "INTERNAL";

class ChildProcessExecutor {
  constructor(parameters, processor, scriptName, done) {
    this.parameters = parameters;
    this.processor = processor;
    this.scriptName = scriptName;
    this.done = done;

    this.childProcess = null;
    this.mmrelog = "";
    this.stderr = undefined;
    this.readResult = this.readResult.bind(this);
  }

  execute() {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log(this.scriptName);
      }

      this.childProcess = child_process.fork(
        this.scriptName,
        this.parameters.args,
        { silent: true }
      );
      this.childProcess.once(CLOSE_EVENT, this.readResult);
      this.childProcess.stderr.on(DATA_EVENT, (data) => {
        if (process.env.NODE_ENV === "development") {
          console.log(data.toString());
        }

        const errorMessage = data
          ? data.toString()
          : `Problems with '${this.scriptName}'`;
        this.stderr = new Error(errorMessage);
      });
      this.childProcess.stdout.on(DATA_EVENT, (data) => {
        this.mmrelog += data.toString();

        if (process.env.NODE_ENV === "development") {
          console.log(data.toString());
        }
      });

      this.childProcess.on(MESSAGE_EVENT, (data) => {
        if (process.env.NODE_ENV === "development") {
          console.log(data.toString());
        }
        this.processor.sendProgress(data);
      });
    } catch (err) {
      this.done();
      this.sendError(err);
    }
  }

  cancel() {
    this.processor.sendCancel();
    if (this.childProcess) {
      this.childProcess.removeAllListeners();
      this.childProcess.kill(SIGKILL_SIGNAL);
    }
  }

  async readResult() {
    try {
      if (this.stderr) {
        throw this.stderr;
      }
      if (this.parameters.infoFile) {
        const infoText = await fs.readFile(this.parameters.infoFile, ENCODING);
        await this.parseInfo(infoText);
      } else if (this.parameters.outputFile) {
        const outputText = await fs.readFile(
          this.parameters.outputFile,
          ENCODING
        );
        await this.parseOutput(outputText);
      } else {
        this.sendError(new Error(NO_OUTPUT_MESSAGE));
      }

      if (this.parameters.inputFile) {
        await fs.unlink(this.parameters.inputFile);
      }
    } catch (err) {
      this.sendError(err);
    }
    this.done();
  }

  sendError(err) {
    if (err.name === INTERNAL) {
      this.processor.sendInternalError(err);
    } else {
      this.processor.sendError(err);
    }
  }

  async parseInfo(infoText) {
    await fs.unlink(this.parameters.infoFile);

    const info = JSON.parse(infoText);
    if (info.status === OK_STATUS) {
      if (this.parameters.outputFile) {
        const outputText = await fs.readFile(
          this.parameters.outputFile,
          ENCODING
        );
        await this.parseOutput(outputText);
      } else {
        this.processor.sendSuccessInfo(info);
      }
    } else {
      throw this.createError(info);
    }
  }

  createError(info) {
    const error = new Error(info.message);
    const stackMessage = `stack:${info.stack}\n`;
    const logMessage = `log:${this.mmrelog}`;
    const envBlock = this.parameters.env
      ? `\nenv:${JSON.stringify(this.parameters.env, null, "")}\n`
      : ``;
    error.stack =
      envBlock +
      `${info.stack ? stackMessage : ""}` +
      `${this.mmrelog && info.category === INTERNAL ? logMessage : ""}`;
    error.name = info.category;
    return error;
  }

  async parseOutput(outputText) {
    await fs.unlink(this.parameters.outputFile);
    const output = JSON.parse(outputText);
    this.processor.sendSuccessOutput(output);
  }
}

module.exports = ChildProcessExecutor;
