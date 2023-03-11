import {
  ACTION_TOGGLE_NEW_MODEL_MODAL,
  setDiagramAreaMode,
  setUnsavedChangesModalAction,
  toggleAsideLeft,
  toggleAsideRight,
  toggleNewModelModal,
  toggleUnsavedChangesModal
} from "../actions/ui";
import { DEV_DEBUG, isDebug } from "../web_env";
import { Features, isFeatureAvailable } from "../helpers/features/features";
import React, { Component } from "react";
import {
  addNotification,
  addNotificationSimple
} from "../actions/notifications";
import {
  executeOpenAction,
  fetchModel,
  provideModel,
  saveModel,
  updateModelProperty
} from "../actions/model";
import {
  finishTransaction,
  redo,
  startTransaction,
  undo
} from "../actions/undoredo";
import { matchPath, withRouter } from "react-router-dom";

import { DiagramAreaMode } from "../enums/enums";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { clearProcessedUndo } from "../helpers/history/undo_logger";
import { connect } from "react-redux";
import { copySelectedTables } from "../actions/copy";
import { fetchRelation } from "../actions/relations";
import { getHistoryContext } from "../helpers/history/history";
import isElectron from "is-electron";
import { setObjectsCopyList } from "../actions/objects_copies";

const ipcRenderer = isElectron() ? window.ipcRenderer : undefined;

class ElectronMenu extends Component {
  constructor(props) {
    super(props);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleUndoClick = this.handleUndoClick.bind(this);
    this.handleRedoClick = this.handleRedoClick.bind(this);
    this.newModel = this.newModel.bind(this);
    this.state = { forcedError: null };
  }

  componentDidMount() {
    this.addEventListeners();
    if (isElectron()) {
      ipcRenderer.on(
        "model:wantToOpen",
        this.props.executeOpenAction.bind(
          this,
          this.props.history,
          this.props.match
        )
      );
      ipcRenderer.on("model:wantNew", this.newModel);

      ipcRenderer.on("model:wantToSave", (event, result) => {
        this.props.saveModel(ipcRenderer, false, true, () => {});
      });
      ipcRenderer.on("model:wantToSaveAs", (event, result) => {
        this.props.saveModel(ipcRenderer, true, true, () => {});
      });
      ipcRenderer.on("model:undo", (event, result) => {
        this.handleUndoClick();
      });
      ipcRenderer.on("model:redo", (event, result) => {
        this.handleRedoClick();
      });
      ipcRenderer.on("model:copy", (event, result) => {
        this.props.setObjectsCopyList();
      });
      ipcRenderer.on("model:paste", async (event, result) => {
        await this.props.copySelectedTables(
          this.props.objectsCopyList,
          this.props
        );
      });
    }
  }

  componentWillUnmount() {
    var appWindow = document.getElementById("app-layout");
    if (appWindow !== null) {
      appWindow.removeEventListener("keydown", this.handleKeyDown, false);
    }
  }

  renderForcedError() {
    if (this.state.forcedError === true) {
      throw new Error("Test Error");
    }
  }

  menuStatus(props) {
    const isEnabledToolbarItem = props.match.params.mid ? true : false;
    const canBeSaved = props.isDirty;
    const isCopy = _.size(props.selections) >= 1;
    const isUndo = props.pivotUndo >= 0;
    const isRedo = props.pivotRedo >= 0;
    const supportRunInstances = isFeatureAvailable(
      props.profile.availableFeatures,
      Features.MULTIPLE_INSTANCES
    );

    return {
      UNDO: {
        isEnabled: isEnabledToolbarItem && isUndo
      },
      REDO: {
        isEnabled: isEnabledToolbarItem && isRedo
      },
      COPY: {
        isEnabled: isEnabledToolbarItem && isCopy
      },
      PASTE: {
        isEnabled: isEnabledToolbarItem
      },
      NEW: {
        isEnabled: true
      },
      OPEN: {
        isEnabled: true
      },
      SAVE: {
        isEnabled: canBeSaved
      },
      SAVEAS: {
        isEnabled: isEnabledToolbarItem || canBeSaved
      },
      RUNINSTANCES: {
        isEnabled: supportRunInstances
      }
    };
  }

  componentDidUpdate(prevProps) {
    const prevMenuStatus = this.menuStatus(prevProps);
    const currentMenuStatus = this.menuStatus(this.props);

    if (!_.isEqual(prevMenuStatus, currentMenuStatus)) {
      ipcRenderer && ipcRenderer.send("app:updateMenu", currentMenuStatus);
    }
  }

  async onShowLeftPanel() {
    await this.props.toggleAsideLeft();
  }

  async onShowRightPanel() {
    await this.props.toggleAsideRight();
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

  addEventListeners() {
    var appWindow = document.getElementById("app-layout");
    if (appWindow !== null) {
      appWindow.addEventListener("keydown", this.handleKeyDown, false);

      appWindow.addEventListener("mouseup", async (e) => {
        const isBackwardButton = e.button === 3;
        const isForwardButton = e.button === 4;
        if (isForwardButton || isBackwardButton) {
          if (isForwardButton) {
            await this.props.redo(
              getHistoryContext(this.props.history, this.props.match)
            );
          }

          if (isBackwardButton) {
            await this.props.undo(
              getHistoryContext(this.props.history, this.props.match)
            );
          }

          // prevent mouse default forward/backward navigation (change URL)
          e.preventDefault();
        }
      });
    }
  }

  async handleUndoClick() {
    await this.props.undo(
      getHistoryContext(this.props.history, this.props.match)
    );
  }

  async handleRedoClick() {
    await this.props.redo(
      getHistoryContext(this.props.history, this.props.match)
    );
  }

  handleKeyDown(event) {
    const charCode = String.fromCharCode(event.which).toLowerCase();
    const BACKSPACE_KEY = "Backspace";
    if (
      isDebug([DEV_DEBUG]) &&
      ((event.ctrlKey && event.shiftKey && event.key === BACKSPACE_KEY) ||
        (event.metaKey && event.shiftKey && event.key === BACKSPACE_KEY))
    ) {
      clearProcessedUndo(this.props.type);
      event.preventDefault();
    } else if (
      (event.ctrlKey && event.shiftKey && charCode === "z") ||
      (event.metaKey && event.shiftKey && charCode === "z")
    ) {
      this.handleRedoClick();
      event.preventDefault();
    } else if (
      (event.ctrlKey && charCode === "z") ||
      (event.metaKey && charCode === "z")
    ) {
      this.handleUndoClick();
      event.preventDefault();
    } else if (
      (event.ctrlKey && charCode === "s") ||
      (event.metaKey && charCode === "s")
    ) {
      if (matchPath(this.props.location.pathname, "/model/:id")) {
        this.props.saveModel(ipcRenderer, false, true, () => {});
      }
      event.preventDefault();
    } else if (
      (event.ctrlKey && charCode === "o") ||
      (event.metaKey && charCode === "o")
    ) {
      this.props.executeOpenAction(this.props.history, this.props.match);
      event.preventDefault();
    } else if (event.key === "Escape" || event.keyCode === 27) {
      this.props.setDiagramAreaMode(DiagramAreaMode.ARROW);
      event.preventDefault();
    } else if (event.ctrlKey && event.shiftKey && event.keyCode === 190) {
      console.log("keys for fixable error pressed");
      this.props.fetchRelation({ id: "id", name: "name", parent: "" }, true);

      event.preventDefault();
    } else if (event.ctrlKey && event.shiftKey && event.keyCode === 188) {
      console.log("keys for error pressed");
      this.setState({ forcedError: true });
      event.preventDefault();
    } else if (
      (event.ctrlKey && event.shiftKey && charCode === "p") ||
      (event.metaKey && event.shiftKey && charCode === "p")
    ) {
      this.onShowLeftPanel();
      this.onShowRightPanel();
      event.preventDefault();
    }
  }

  render() {
    return <>{this.renderForcedError()}</>;
  }
}

function mapStateToProps(state) {
  return {
    isDirty: state.model.isDirty,
    settings: state.settings,
    pivotRedo: state.undoRedo.pivotRedo,
    pivotUndo: state.undoRedo.pivotUndo,
    selections: state.selections,
    newModelModalIsDisplayed: state.ui.newModelModalIsDisplayed,
    openFromUrlModalIsDisplayed: state.ui.openFromUrlModalIsDisplayed,
    type: state.model.type,
    profile: state.profile
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        undo,
        redo,
        updateModelProperty,
        addNotification,
        fetchModel,
        provideModel,
        setDiagramAreaMode,
        toggleAsideLeft,
        toggleAsideRight,
        addNotificationSimple,
        setObjectsCopyList,
        copySelectedTables,
        setUnsavedChangesModalAction,
        toggleUnsavedChangesModal,
        toggleNewModelModal,
        finishTransaction,
        startTransaction,
        saveModel,
        executeOpenAction,
        fetchRelation
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ElectronMenu)
);
