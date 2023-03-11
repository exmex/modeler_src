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
  isFreeware
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

import ModelsList from "./models_list";
import NavigateBack from "./navigate_back";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import UnsavedModelsList from "./unsaved_models_list";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../helpers/history/history";
import { getSupportedModelTypes } from "../app_config";
import { getUnsavedModels } from "../selectors/selector_recovery";
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
    return _.map(
      _.filter(getSupportedModelTypes(), (type) => type.importFromFile),
      (type) => type.id
    );
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

  joinPlatformNames(names) {
    return names.reduce((result, name, index, items) => {
      if (index === 0) {
        return name;
      }
      if (index < items.length - 1) {
        return `${result}, ${name}`;
      } else {
        return `${result} or ${name}`;
      }
    }, "");
  }

  showHint() {
    const reverseMessage = `Create a new database connection, load and visualize ${this.joinPlatformNames(
      _.map(
        _.filter(getSupportedModelTypes(), (type) => !!type.loadFromDatabase),
        (type) => type.text
      )
    )} structures.`;

    const importFromFileMessage = `Import your ${this.joinPlatformNames(
      _.map(
        _.filter(getSupportedModelTypes(), (type) => !!type.importFromFile),
        (type) => type.text
      )
    )} structure from an already existing file.`;

    const importFromUrlMessage = `Import your ${this.joinPlatformNames(
      _.map(
        _.filter(getSupportedModelTypes(), (type) => !!type.importFromURL),
        (type) => type.text
      )
    )} schema from an URL.`;

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
          ? this.buyNowMessage(importFromFileMessage)
          : importFromFileMessage;
      case "importFromUrl":
        return isFreeware(this.props.profile)
          ? this.buyNowMessage(importFromUrlMessage)
          : importFromUrlMessage;
      default:
        return "";
    }
  }

  renderLoadFromDatabaseButton() {
    const existsLoadFromDatabase = !!_.find(
      getSupportedModelTypes(),
      (type) => type.loadFromDatabase
    );
    const disabled =
      isFeatureAvailable(
        this.props.profile.availableFeatures,
        Features.DISABLED_CONNECTIONS
      ) && existsLoadFromDatabase;

    const enabled =
      isFeatureAvailable(
        this.props.profile.availableFeatures,
        Features.CONNECTIONS
      ) && existsLoadFromDatabase;
    const available = enabled || disabled;
    const disabledClassname = disabled ? " im-disabled" : "";
    const buttonClassname =
      "im-btn-default im-margin-right im-btn-reverse" + disabledClassname;
    return (
      available && (
        <button
          className={buttonClassname}
          onClick={() =>
            enabled ? this.props.history.push("/connections") : undefined
          }
          onMouseEnter={() => this.setState({ hintId: "reverse" })}
          onMouseLeave={() => this.setState({ hintId: "" })}
          data-testid={TEST_ID.MODELS.LOAD_FROM_DATABASE}
        >
          Load from database
        </button>
      )
    );
  }

  renderRE() {
    return (
      <>
        {this.renderLoadFromDatabaseButton()}
        {this.renderImportFromFileButton()}
        {this.renderImportFromUrl()}
      </>
    );
  }

  renderImportFromUrl() {
    const existsImportFromURL = !!_.find(
      getSupportedModelTypes(),
      (type) => type.importFromURL
    );
    const enabled =
      isFeatureAvailable(
        this.props.profile.availableFeatures,
        Features.IMPORT_FROM_URL
      ) && existsImportFromURL;

    const handleImportFromURLClick = enabled
      ? this.toggleImportFromUrl
      : undefined;

    const buttonClassname = "im-btn-default im-margin-right im-btn-reverse";

    return (
      enabled && (
        <button
          className={buttonClassname}
          onClick={handleImportFromURLClick}
          onMouseEnter={() => this.setState({ hintId: "importFromUrl" })}
          onMouseLeave={() => this.setState({ hintId: "" })}
          data-testid={TEST_ID.MODELS.IMPORT_FROM_URL}
        >
          Import from URL
        </button>
      )
    );
  }

  renderImportFromFileButton() {
    const existsImportFromFile = !!_.find(
      getSupportedModelTypes(),
      (type) => type.importFromFile
    );
    const disabled =
      isFeatureAvailable(
        this.props.profile.availableFeatures,
        Features.DISABLED_IMPORT_FROM_FILE
      ) && existsImportFromFile;

    const enabled =
      isFeatureAvailable(
        this.props.profile.availableFeatures,
        Features.IMPORT_FROM_FILE
      ) && existsImportFromFile;

    const handleImportClick = enabled ? this.import : undefined;

    const available = enabled || disabled;
    const disabledClassname = disabled ? " im-disabled" : "";
    const buttonClassname =
      "im-btn-default im-margin-right im-btn-reverse" + disabledClassname;
    return (
      available && (
        <button
          className={buttonClassname}
          onClick={handleImportClick}
          onMouseEnter={() => this.setState({ hintId: "import" })}
          onMouseLeave={() => this.setState({ hintId: "" })}
          data-testid={TEST_ID.MODELS.IMPORT_FILE}
        >
          Import file
        </button>
      )
    );
  }

  renderOpenFromUrl() {
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

  hasUnsavedModelList() {
    return !_.isEmpty(this.props.unsavedModelList);
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
                {this.hasUnsavedModelList() ? (
                  <Tab>Projects to restore</Tab>
                ) : (
                  <></>
                )}
                <Tab>The latest projects</Tab>
              </TabList>

              {this.renderSearchInput()}
            </div>

            {this.hasUnsavedModelList() ? (
              <TabPanel className="im-aside">
                <UnsavedModelsList searchTerm={this.state.searchTerm} />
              </TabPanel>
            ) : (
              <></>
            )}
            <TabPanel className="im-aside">
              <ModelsList searchTerm={this.state.searchTerm} />
            </TabPanel>
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
    unsavedModelList: getUnsavedModels(state),
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
