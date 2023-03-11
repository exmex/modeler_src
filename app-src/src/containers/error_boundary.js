import * as sourceStackTrace from "sourcemapped-stacktrace";

import { DEV_DEBUG, isDebug } from "../web_env";
import React, { Component } from "react";
import { clearModel, loadModel, modernizeModel } from "../actions/model";
import {
  finishTransaction,
  getCurrentHistoryTransaction,
  startTransaction
} from "../actions/undoredo";
import { getAppName, getAppTitle, getAppVersion } from "common";
import { storeSettings, updateSettingsProperty } from "../actions/settings";

import CollapsiblePanel from "../components/collapsible_panel";
import { ModelIntegrationCheckBuilder } from "../helpers/model/model-integration-check";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { clearBackupModel } from "../actions/restore";
import { connect } from "react-redux";
import { getHistoryContext } from "../helpers/history/history";
import { withRouter } from "react-router-dom";

const ipcRenderer = window?.ipcRenderer;

const INITIAL_STATE = {
  hasError: false,
  done: false,
  customMessage: "",
  fixedModel: undefined,
  problems: "",
  hintId: "",
  logText: "",
  message: "",
  stackTrace: [],
  internal: false
};
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
    this.handleChange = this.handleChange.bind(this);
  }

  showHint() {
    switch (this.state.hintId) {
      case "quit":
        return "The next time you run the application, you will have the option to load the project from an existing backup, if available.";
      case "restart":
        return "Restart the application and if there is a backup of your project, you will be able to load it.";
      case "continue":
        return "You can continue working on the project, any known errors have been corrected.";
      default:
        return "";
    }
  }

  handleChange(event) {
    this.setState({ customMessage: event.target.value });
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  static async convertStackTrace(minifiedStack) {
    return new Promise((resolve) => {
      sourceStackTrace.mapStackTrace(minifiedStack, (stackTrace) => {
        resolve(stackTrace);
      });
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.internalError !== this.props.internalError) {
      if (this.doNotReportError()) {
        this.setState({
          hasError: true,
          internal: true,
          done: true
        });
      } else {
        const message = `${this.props.internalError.message}\n${this.props.internalError.stack}`;
        const logText = this.getLogText(message, this.state.problems, []);
        this.setState({
          hasError: true,
          internal: true,
          message,
          stackTrace: [],
          logText
        });
      }
    }
  }

  async tryCorrectModel() {
    const { fixedModel, problems } = await this.getFixedModelAndProblems();
    const logText = this.getLogText(
      this.state.message,
      problems,
      this.state.stackTrace
    );
    this.setState({
      fixedModel,
      problems,
      logText,
      done: this.doNotReportError()
    });
  }

  doNotReportError() {
    return this.props.reportError === "never";
  }

  async componentDidCatch(error) {
    if (this.doNotReportError()) {
      await this.tryCorrectModel();
    } else {
      const stackTrace = await ErrorBoundary.convertStackTrace(error.stack);
      this.setState(
        {
          message: error.message,
          stackTrace
        },
        this.tryCorrectModel
      );
    }
  }

  getError(type, message, problems, stackTrace) {
    const typeLine = type ? `Platform: ${type}\n` : ``;
    const messageLine = `${message}\n`;
    const problemsLine = `${problems}\n`;
    const stackTraceLines = (stackTrace || []).join("\n");
    return `\n` + typeLine + messageLine + problemsLine + stackTraceLines;
  }

  async sendErrorToServer(error_data_object) {
    const error_data = JSON.stringify(error_data_object);
    const URL = "https://www.datensen.com/errorlog/errorlogpost.php";
    const myInit = {
      method: "POST",
      mode: "no-cors",
      body: error_data
    };
    if (isDebug([DEV_DEBUG])) {
      console.log(error_data_object);
    } else {
      const myRequest = new Request(URL, myInit);

      try {
        await fetch(myRequest);
      } catch {
        // no response to error
      }
    }
  }

  buildErrorDataObject(message, problems, stackTrace) {
    return {
      product: getAppName(process.env.REACT_APP_PRODUCT),
      version: getAppVersion(process.env.REACT_APP_PRODUCT),
      error: this.getError(this.props.type, message, problems, stackTrace),
      message: this.state.customMessage,
      license: this.props.profile.licInfo.licType
    };
  }

  async sendError(message, problems, stackTrace) {
    const error_data_object = this.buildErrorDataObject(
      message,
      problems,
      stackTrace
    );
    await this.sendErrorToServer(error_data_object);
  }

  getLogText(message, problems, stackTrace) {
    const errorDataObject = this.buildErrorDataObject(
      message,
      problems,
      stackTrace
    );

    return (
      `Product: ${errorDataObject.product}\n` +
      `Version: ${errorDataObject.version}\n` +
      `License: ${errorDataObject.license}\n` +
      `Message: ${errorDataObject.message}\n` +
      `Details: ${errorDataObject.error}`
    );
  }

  getProblems(problems) {
    const problemsText = problems
      .map((problem) => problem.getTitle())
      .join(",");
    return problemsText ? `Found problems:${problemsText}\n` : ``;
  }

  async getFixedModelAndProblems() {
    let problems = "";
    try {
      const state = this.props.store.getState();
      const check = new ModelIntegrationCheckBuilder(
        state,
        this.props.profile
      ).build();
      const foundProblems = check.check();
      if (foundProblems.length > 0) {
        const fixedModel = check.fix(foundProblems);

        return { fixedModel, problems: this.getProblems(foundProblems) };
      }
    } catch (e) {
      const stackTrace = await ErrorBoundary.convertStackTrace(e.stack);
      problems = (e.message || "") + "\n" + (stackTrace || []).join("\n");
    }
    return { fixedModel: undefined, problems };
  }

  async saveSettings(value) {
    await this.props.updateSettingsProperty(value, "reportError");
    await this.props.storeSettings();
  }

  async send() {
    this.sendError(
      this.state.message,
      this.state.problems,
      this.state.stackTrace
    );
    this.setState({ done: true });
  }

  async neverSend() {
    this.setState({ done: true });
  }

  getSendButtonText() {
    return isDebug([DEV_DEBUG])
      ? `YES, WRITE TO CONSOLE LOG`
      : `YES, SEND ERROR LOG`;
  }

  renderSendQuestion() {
    return !this.state.done && !this.doNotReportError() ? (
      <div className="im-align-center im-padding-md">
        <h2>Do you want to send us an error log?</h2>
        <p>The log will help us improve the application sooner.</p>
        <div className="im-error-feedback">
          <br />
          <p>
            Describe your last action made in the application, please.
            (Optional)
          </p>
          <div className="im-flex-cols">
            <textarea
              type="text"
              placeholder="If you want to receive our answer, also type in your email address."
              value={this.state.customMessage}
              onChange={this.handleChange.bind(this)}
            ></textarea>
          </div>
          <div className="im-error-feedback im-dark im-tiny-text">
            <CollapsiblePanel
              panelKey="pErrorLog"
              panelTitle="Log"
              panelIsExpanded={false}
            >
              <div className="im-flex-cols">
                <textarea readOnly value={this.state.logText}></textarea>
              </div>
            </CollapsiblePanel>
          </div>
        </div>
        <br />

        <button
          className="im-btn-secondary im-margin-right im-btn-reverse"
          onClick={this.neverSend.bind(this)}
        >
          NO
        </button>
        <button
          className="im-btn-default im-margin-right im-btn-reverse"
          onClick={this.send.bind(this)}
        >
          {this.getSendButtonText()}
        </button>
      </div>
    ) : (
      <></>
    );
  }

  isLinux() {
    return window.navigator.appVersion.indexOf("Linux") !== -1;
  }

  renderQuitRestartContinue() {
    return (
      <div className="im-align-center im-padding-md">
        {this.state.done === true && ipcRenderer ? (
          <button
            onMouseEnter={() => this.setState({ hintId: "quit" })}
            onMouseLeave={() => this.setState({ hintId: "" })}
            className="im-btn-default im-margin-right im-btn-reverse"
            onClick={() =>
              ipcRenderer && ipcRenderer.send("app:quit", "just quit")
            }
          >
            Quit {getAppTitle(process.env.REACT_APP_PRODUCT)}
          </button>
        ) : undefined}
        {this.state.done === true && ipcRenderer && !this.isLinux() ? (
          <button
            onMouseEnter={() => this.setState({ hintId: "restart" })}
            onMouseLeave={() => this.setState({ hintId: "" })}
            className="im-btn-default im-margin-right im-btn-reverse"
            onClick={() =>
              ipcRenderer && ipcRenderer.send("app:reload", "reload")
            }
          >
            Restart {getAppTitle(process.env.REACT_APP_PRODUCT)}
          </button>
        ) : undefined}
        {this.state.fixedModel && this.state.done === true && ipcRenderer ? (
          <button
            onMouseEnter={() => this.setState({ hintId: "continue" })}
            onMouseLeave={() => this.setState({ hintId: "" })}
            className="im-btn-default im-margin-right im-btn-reverse"
            onClick={this.loadFixedModel.bind(this)}
          >
            Continue with corrected project
          </button>
        ) : undefined}

        <div className="hint-wrapper im-padding-md">
          {this.state.hintId !== "" && (
            <div className="im-align-center hint">{this.showHint()}</div>
          )}
        </div>
      </div>
    );
  }

  async loadFixedModel() {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.ERROR_BOUNDARY__LOAD_FIXED_MODEL
    );
    const shouldClearModel = true;
    try {
      const newModel = this.state.fixedModel;
      // clear model to prevent same bug to repeat this modal
      await this.props.clearModel();
      await this.props.clearBackupModel(ipcRenderer);
      this.setState(INITIAL_STATE, async () => {
        const modernizedModel = modernizeModel(newModel);
        await this.props.loadModel(
          modernizedModel,
          getCurrentHistoryTransaction().historyContext,
          shouldClearModel
        );
      });
    } finally {
      await this.props.finishTransaction(shouldClearModel);
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="im-not-supported">
          <div className="im-full-page-wrapper">
            <h1>Something went wrong</h1>
            <p>We apologize for the inconveniences.</p>
            {this.renderSendQuestion()}
            {this.renderQuitRestartContinue()}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function mapStateToProps(state) {
  return {
    settings: state.settings,
    profile: state.profile,
    internalError: state.internalError,
    type: state.model.type
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        loadModel,
        updateSettingsProperty,
        clearBackupModel,
        clearModel,
        finishTransaction,
        startTransaction,
        storeSettings
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ErrorBoundary)
);
