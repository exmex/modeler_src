import {
  ACTION_TOGGLE_IMPORT_FROM_URL_MODAL,
  ACTION_TOGGLE_NEW_MODEL_MODAL,
  ACTION_TOGGLE_OPEN_FROM_URL_MODAL,
  setUnsavedChangesModalAction,
  toggleImportFromUrlModal,
  toggleNewModelModal,
  toggleOpenFromUrlModal,
  toggleUnsavedChangesModal
} from "../actions/ui";
import {
  Features,
  isFeatureAvailable,
  isFreeware,
  isMoon,
  isPerseid
} from "../helpers/features/features";
import {
  IPCContext,
  createImportModelAction,
  createOpenAction
} from "../helpers/ipc/ipc";
import React, { Component } from "react";
import { TEST_ID, getAppTitle } from "common";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import {
  finishTransaction,
  getCurrentHistoryTransaction,
  startTransaction
} from "../actions/undoredo";

import { ModelTypes } from "../enums/enums";
import ModelsList from "./models_list";
import ModelsSamples from "./models_samples";
import NavigateBack from "./navigate_back";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../helpers/history/history";
import isElectron from "is-electron";
import { provideModel } from "../actions/model";
import { withRouter } from "react-router-dom";

class Models extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hintId: "",
      searchTerm: ""
    };
    this.newModel = this.newModel.bind(this);
    this.open = this.open.bind(this);
    this.import = this.import.bind(this);
    this.toggleOpenFromUrl = this.toggleOpenFromUrl.bind(this);
    this.toggleImportFromUrl = this.toggleImportFromUrl.bind(this);
    this.refSearchBox = React.createRef();
    this.clearSearchTerm = this.clearSearchTerm.bind(this);
    this.onInputChangeDebounced = _.debounce(
      this.onInputChangeDebounced.bind(this),
      200
    );
  }

  clearSearchTerm() {
    this.setState({ searchTerm: "" });
    this.refSearchBox.current.value = "";
  }

  // the searchTerm in state is almost not needed, only left due to debounce
  onInputChangeDebounced() {
    this.setState({ searchTerm: this.refSearchBox.current.value });
  }

  renderSearchInput() {
    var buttonDisplayedStyle = "";

    this.state.searchTerm?.length > 0
      ? (buttonDisplayedStyle = "im-search-button")
      : (buttonDisplayedStyle = "im-display-none");

    return (
      <div className="im-search-bar">
        <div></div>
        <input
          data-testid={TEST_ID.COMPONENTS.INPUT_SEARCH_MODEL}
          className="im-search-box-input"
          placeholder="Search by name or type"
          type="text"
          id="searchInput"
          ref={this.refSearchBox}
          onChange={this.onInputChangeDebounced}
        />
        <div
          className={buttonDisplayedStyle}
          onClick={this.clearSearchTerm.bind(this)}
        >
          <i className="im-icon-Cross16 im-icon-16" />
        </div>
        <div />
      </div>
    );
  }

  async newModel() {
    if (this.props.isDirty === true) {
      await this.props.setUnsavedChangesModalAction({
        name: ACTION_TOGGLE_NEW_MODEL_MODAL
      });
      await this.props.toggleUnsavedChangesModal();
    } else {
      await this.props.toggleNewModelModal();
    }
  }

  async open() {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.MODELS_OPEN_MODEL
    );
    try {
      await this.props.provideModel(
        getCurrentHistoryTransaction().historyContext,
        this.props.isDirty,
        new IPCContext(createOpenAction()),
        {}
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  async toggleOpenFromUrl() {
    if (this.props.isDirty === true) {
      await this.props.setUnsavedChangesModalAction({
        name: ACTION_TOGGLE_OPEN_FROM_URL_MODAL
      });
      await this.props.toggleUnsavedChangesModal();
    } else {
      await this.props.toggleOpenFromUrlModal();
    }
  }

  async toggleImportFromUrl() {
    if (this.props.isDirty === true) {
      await this.props.setUnsavedChangesModalAction({
        name: ACTION_TOGGLE_IMPORT_FROM_URL_MODAL
      });
      await this.props.toggleUnsavedChangesModal();
    } else {
      await this.props.toggleImportFromUrlModal();
    }
  }

  getSupportedTypes() {
    const supportedTypes = [];

    if (
      isFeatureAvailable(
        this.props.profile.availableFeatures,
        Features.IMPORT_JSONSCHEMA,
        this.props.profile
      )
    ) {
      supportedTypes.push(ModelTypes.JSONSCHEMA);
      supportedTypes.push(ModelTypes.OPENAPI);
      supportedTypes.push(ModelTypes.FULLJSON);
    }

    if (
      isFeatureAvailable(
        this.props.profile.availableFeatures,
        Features.CONNECTIONS,
        this.props.profile
      )
    ) {
      supportedTypes.push(ModelTypes.GRAPHQL);
      supportedTypes.push(ModelTypes.SQLITE);
    }
    return supportedTypes;
  }

  async import() {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.MODELS_IMPORT_MODEL
    );

    const supportedTypes = this.getSupportedTypes();

    try {
      await this.props.provideModel(
        getCurrentHistoryTransaction().historyContext,
        this.props.isDirty,
        new IPCContext(createImportModelAction()),
        { autolayout: true, cancelable: true, supportedTypes }
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  buyNowMessage(message) {
    return (
      <>
        <div>{message}</div>
        <div className="im-input-tip">
          This feature is available in the commercial version.
        </div>
      </>
    );
  }

  showHint() {
    const reverseMessage =
      "Create a new database connection, load and visualize MongoDB, MariaDB, MySQL or PostgreSQL structures.";
    const importMessageMoon =
      "Import your GraphQL schema or SQLite database from an already existing file.";
    const importMessagePerseid =
      "Import your JSON Schema or Open API structure from an already existing file.";
    const importMessage = isPerseid(this.props.profile)
      ? importMessagePerseid
      : importMessageMoon;
    const importFromUrlMessage = "Import your GraphQL schema from an URL.";

    switch (this.state.hintId) {
      case "project":
        return "Create a new project and design your database structure or schema visually.";
      case "open":
        return `Open an already existing project created in ${getAppTitle(
          process.env.REACT_APP_PRODUCT
        )}.`;
      case "openFromUrl":
        return "Open a project from URL.";
      case "reverse":
        return isFreeware(this.props.profile)
          ? this.buyNowMessage(reverseMessage)
          : reverseMessage;
      case "import":
        return isFreeware(this.props.profile)
          ? this.buyNowMessage(importMessage)
          : importMessage;
      case "importFromUrl":
        return isFreeware(this.props.profile)
          ? this.buyNowMessage(importMessage)
          : importFromUrlMessage;
      default:
        return "";
    }
  }
  renderRE() {
    const disabledRE = isFeatureAvailable(
      this.props.profile.availableFeatures,
      Features.DISABLED_CONNECTIONS,
      this.props.profile
    );
    const enabledRE = isFeatureAvailable(
      this.props.profile.availableFeatures,
      Features.CONNECTIONS,
      this.props.profile
    );

    const enabledImport = isFeatureAvailable(
      this.props.profile.availableFeatures,
      Features.IMPORT_JSONSCHEMA,
      this.props.profile
    );

    const disabledClassname = disabledRE ? " im-disabled" : "";
    const importClick = enabledRE || enabledImport ? this.import : undefined;
    const importFromUrlClick = enabledRE ? this.toggleImportFromUrl : undefined;
    if (enabledRE || disabledRE) {
      return (
        <>
          <button
            className={
              "im-btn-default im-margin-right im-btn-reverse" +
              disabledClassname
            }
            onClick={() =>
              enabledRE ? this.props.history.push("/connections") : undefined
            }
            onMouseEnter={() => this.setState({ hintId: "reverse" })}
            onMouseLeave={() => this.setState({ hintId: "" })}
            data-testid={TEST_ID.MODELS.LOAD_FROM_DATABASE}
          >
            Load from database
          </button>
          <button
            className={
              "im-btn-default im-margin-right im-btn-import" + disabledClassname
            }
            onClick={importClick}
            onMouseEnter={() => this.setState({ hintId: "import" })}
            onMouseLeave={() => this.setState({ hintId: "" })}
            data-testid={TEST_ID.MODELS.IMPORT_FILE}
          >
            Import file
          </button>
          <button
            className={
              "im-btn-default im-margin-right im-btn-import" + disabledClassname
            }
            onClick={importFromUrlClick}
            onMouseEnter={() => this.setState({ hintId: "importFromUrl" })}
            onMouseLeave={() => this.setState({ hintId: "" })}
            data-testid={TEST_ID.MODELS.IMPORT_FROM_URL}
          >
            Import from URL
          </button>
        </>
      );
    } else if (enabledImport) {
      return (
        <button
          className={
            "im-btn-default im-margin-right im-btn-import" + disabledClassname
          }
          onClick={importClick}
          onMouseEnter={() => this.setState({ hintId: "import" })}
          onMouseLeave={() => this.setState({ hintId: "" })}
          data-testid={TEST_ID.MODELS.IMPORT_FILE}
        >
          Import file
        </button>
      );
    }
  }

  renderOpenFromUrl() {
    if (isMoon(this.props.profile))
      return (
        <button
          className="im-btn-default im-margin-right im-btn-open"
          onClick={this.toggleOpenFromUrl}
          onMouseEnter={() => this.setState({ hintId: "openFromUrl" })}
          onMouseLeave={() => this.setState({ hintId: "" })}
        >
          Open from URL
        </button>
      );
  }

  render() {
    return (
      <div tabIndex={2} className="im-full-page-scroll">
        <NavigateBack />
        <div className="im-full-page-wrapper">
          <div className="im-header-1 im-align-center">Projects</div>
          <div className="im-align-center im-padding-md">
            <button
              onMouseEnter={() => this.setState({ hintId: "project" })}
              onMouseLeave={() => this.setState({ hintId: "" })}
              className="im-btn-default im-margin-right"
              onClick={this.newModel}
              data-testid={TEST_ID.MODELS.NEW_PROJECT}
            >
              New project
            </button>
            <button
              className="im-btn-default im-margin-right im-btn-open"
              onClick={this.open}
              onMouseEnter={() => this.setState({ hintId: "open" })}
              onMouseLeave={() => this.setState({ hintId: "" })}
            >
              Open from file
            </button>
            {this.renderOpenFromUrl()}
            {this.renderRE()}
          </div>
          <div className="hint-wrapper">
            {this.state.hintId !== "" && (
              <div className="im-align-center hint">{this.showHint()}</div>
            )}
          </div>

          <Tabs className="im-tabs">
            <div className="im-project-tablist">
              <TabList>
                <Tab>The latest projects</Tab>
                {isMoon(this.props.profile) && <Tab>Examples</Tab>}
              </TabList>

              {this.renderSearchInput()}
            </div>

            <TabPanel className="im-aside">
              <ModelsList searchTerm={this.state.searchTerm} />
            </TabPanel>

            {isMoon(this.props.profile) && (
              <TabPanel className="im-aside">
                {isElectron() ? (
                  <ModelsSamples searchTerm={this.state.searchTerm} />
                ) : (
                  <div />
                )}
              </TabPanel>
            )}
          </Tabs>

          <div className="im-align-center im-padding-md" />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    isDirty: state.model.isDirty,
    profile: state.profile,
    modelsList: state.modelsList,
    modelsSamples: state.modelsSamples
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleNewModelModal,
        provideModel,
        setUnsavedChangesModalAction,
        toggleUnsavedChangesModal,
        toggleOpenFromUrlModal,
        toggleImportFromUrlModal,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Models));
