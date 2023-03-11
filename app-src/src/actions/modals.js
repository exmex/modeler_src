const ipcRenderer = window?.ipcRenderer;

import {
  ACTION_TOGGLE_NEW_MODEL_MODAL,
  setUnsavedChangesModalAction,
  toggleBuyProModal,
  toggleColumnModal,
  toggleConfirmDelete,
  toggleConfirmDeleteLine,
  toggleConfirmDeleteRelation,
  toggleDiffHTMLReportModal,
  toggleIndexAssistantModal,
  toggleLineModal,
  toggleNewModelModal,
  toggleNoteModal,
  toggleOtherObjectModal,
  toggleRelationModal,
  toggleReportModal,
  toggleTableModal,
  toggleTextEditorModal,
  toggleTipsModal,
  toggleUnsavedChangesModal
} from "./ui";
import { DEV_DEBUG, isDebug } from "../web_env";
import { Features, isFeatureAvailable } from "../helpers/features/features";

import JsonSchemaHelpers from "../platforms/jsonschema/helpers_jsonschema";
import TreeDiagramHelpers from "../helpers/tree_diagram/tree_diagram_helpers";
import UIHelpers from "../helpers/ui_helpers";
import { fetchModelsList } from "./models_list";

export function showConfig(history) {
  history.push("/config");
}

export function showAccount(history) {
  history.push("/account");
}

export function showConnections(history) {
  return async (dispatch, getState) => {
    const ui = getState().ui;
    if (ui.tableModalIsDisplayed) {
      dispatch(toggleTableModal());
    }
    if (ui.relationModalIsDisplayed) {
      dispatch(toggleRelationModal());
    }
    if (ui.newModelModalIsDisplayed) {
      dispatch(toggleNewModelModal());
    }
    if (ui.tipsModalIsDisplayed) {
      dispatch(toggleTipsModal());
    }
    if (ui.columnModalIsDisplayed) {
      dispatch(toggleColumnModal());
    }
    if (ui.textEditorModalIsDisplayed) {
      dispatch(toggleTextEditorModal());
    }
    history.push("/connections");
  };
}

export function showConnectionsUpdate(history) {
  return async (dispatch, getState) => {
    const ui = getState().ui;
    if (ui.tableModalIsDisplayed) {
      dispatch(toggleTableModal());
    }
    if (ui.relationModalIsDisplayed) {
      dispatch(toggleRelationModal());
    }
    if (ui.newModelModalIsDisplayed) {
      dispatch(toggleNewModelModal());
    }
    if (ui.tipsModalIsDisplayed) {
      dispatch(toggleTipsModal());
    }
    if (ui.columnModalIsDisplayed) {
      dispatch(toggleColumnModal());
    }
    if (ui.textEditorModalIsDisplayed) {
      dispatch(toggleTextEditorModal());
    }
    history.push("/connections-update");
  };
}

export async function showModels(history) {
  return async (dispatch, getState) => {
    const ui = getState().ui;
    if (ui.tableModalIsDisplayed) {
      await dispatch(toggleTableModal());
    }
    if (ui.columnModalIsDisplayed) {
      await dispatch(toggleColumnModal());
    }
    if (ui.relationModalIsDisplayed) {
      await dispatch(toggleRelationModal());
    }
    if (ui.indexAssistantModalIsDisplayed) {
      await dispatch(toggleIndexAssistantModal());
    }
    if (ui.newModelModalIsDisplayed) {
      await dispatch(toggleNewModelModal());
    }
    history.push("/models");

    if (!!ipcRenderer) {
      ipcRenderer.on("modelList:updated", async (event, message) => {
        await dispatch(fetchModelsList(message.content));
      });
    } else {
      const modelsListData = localStorage.getItem("dataxmodels");
      await dispatch(fetchModelsList(JSON.parse(modelsListData)));
    }
  };
}

export async function toggleFinder() {
  return async (dispatch, getState) => {
    const ui = getState().ui;
    await dispatch(toggleFinder());
    UIHelpers.setFocusToCanvasAndKeepScrollPosition();
    if (ui.finderIsDisplayed) {
      TreeDiagramHelpers.focusFindOnDiagramInput();
    }
  };
}

export function toggleReportModalExecute() {
  return async (dispatch, getState) => {
    const state = getState();
    if (isDebug([DEV_DEBUG])) {
      dispatch(toggleReportModal());
    } else {
      const isReportsFeatureAvailable = isFeatureAvailable(
        state.profile.availableFeatures,
        Features.REPORTS
      );
      if (isReportsFeatureAvailable) {
        dispatch(toggleReportModal());
      } else {
        dispatch(toggleBuyProModal());
      }
    }
  };
}

export function toggleDiffHTMLReportModalExecute() {
  return async (dispatch, getState) => {
    const state = getState();
    if (isDebug([DEV_DEBUG])) {
      dispatch(toggleDiffHTMLReportModal());
    } else {
      const isReportsFeatureAvailable = isFeatureAvailable(
        state.profile.availableFeatures,
        Features.DIFF_HTML_REPORTS
      );
      if (isReportsFeatureAvailable) {
        dispatch(toggleDiffHTMLReportModal());
      } else {
        dispatch(toggleBuyProModal());
      }
    }
  };
}

export async function edit(historyContext) {
  return async (dispatch, getState) => {
    const state = getState();
    if (
      JsonSchemaHelpers.isPerseidModelType(state.model.type) &&
      historyContext.state.columnId
    ) {
      await dispatch(toggleColumnModal());
    }
    if (historyContext.state.tableId && !state.ui.columnModalIsDisplayed)
      dispatch(toggleTableModal());
    if (historyContext.state.relationId) {
      await dispatch(toggleRelationModal());
    }
    if (historyContext.state.noteId) {
      await dispatch(toggleNoteModal());
    }
    if (historyContext.state.otherObjectId) {
      await dispatch(toggleOtherObjectModal());
    }
    if (historyContext.state.lineId) {
      await dispatch(toggleLineModal());
    }
  };
}

export async function newModel() {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.model.isDirty === true) {
      await dispatch(
        setUnsavedChangesModalAction({
          name: ACTION_TOGGLE_NEW_MODEL_MODAL
        })
      );
      await dispatch(toggleUnsavedChangesModal());
    } else {
      await dispatch(toggleNewModelModal());
    }
  };
}

export function deleteFromDiagram(historyContext) {
  return async (dispatch, getState) => {
    if (historyContext.state.tableId) {
      dispatch(toggleConfirmDelete());
    }
    if (historyContext.state.relationId) {
      dispatch(toggleConfirmDeleteRelation());
    }
    if (historyContext.state.lineId) {
      dispatch(toggleConfirmDeleteLine());
    }
    if (historyContext.state.noteId) {
      dispatch(toggleConfirmDelete());
    }
    if (historyContext.state.otherObjectId) {
      dispatch(toggleConfirmDelete());
    }
  };
}
