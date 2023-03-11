export const FETCH_RESTORE = "fetch_restore";

import {
  ACTION_REOPEN_MODEL,
  initBrowserSettings,
  setUnsavedChangesModalAction,
  toggleUnsavedChangesModal
} from "./ui";
import { IPCContext, createReopenAction } from "../helpers/ipc/ipc";
import {
  clearModel,
  loadModel,
  modernizeModel,
  reopenModel,
  updateModelProperty
} from "./model";
import {
  finishTransaction,
  getCurrentHistoryTransaction,
  startTransaction
} from "./undoredo";

import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";

export const saveBackupModel = (ipcRenderer, timestamp) => {
  return async (dispatch, getState) => {
    const state = getState();

    const existsModel = !!state?.model?.id;
    const isModelModified = state?.model?.isDirty;
    if (existsModel && isModelModified) {
      ipcRenderer.send("restore:backupModel", {
        model: {
          tables: state.tables,
          relations: state.relations,
          notes: state.notes,
          lines: state.lines,
          model: state.model,
          otherObjects: state.otherObjects,
          diagrams: state.diagrams,
          order: state.order
        },
        timestamp
      });
    }
  };
};

export const executeRestoreModel = (historyContext, unsavedModel) => {
  return async (dispatch, getState) => {
    const state = getState();
    const ipcAction = createReopenAction();
    const parameters = {
      filePath: unsavedModel.modelInfo.path,
      removeRestoreItem: unsavedModel.sessionId
    };
    if (state.model.isDirty === true) {
      await dispatch(
        setUnsavedChangesModalAction({
          name: ACTION_REOPEN_MODEL,
          parameters,
          ipcAction
        })
      );
      await dispatch(toggleUnsavedChangesModal());
    } else {
      await dispatch(
        reopenModel(historyContext, new IPCContext(ipcAction), parameters)
      );
    }
  };
};

export const restoreModel = (historyContext, ipcRenderer, modelInfo) => {
  return async (dispatch, getState) => {
    const state = getState();
    await dispatch(
      startTransaction(
        historyContext,
        UndoRedoDef.BACKUP_MODEL_DIALOG__OPEN_BACKUP_MODEL
      )
    );
    try {
      const newModel = state.ui.backupModelDialog.modelData;
      await dispatch(clearModel());
      await dispatch(clearBackupModel(ipcRenderer));
      const modernizedModel = modernizeModel(newModel);
      await dispatch(
        loadModel(
          modernizedModel,
          getCurrentHistoryTransaction().historyContext,
          true
        )
      );
      await dispatch(
        updateModelProperty(
          newModel.model.id,
          state.ui.backupModelDialog.filePath,
          "filePath"
        )
      );
      await dispatch(updateModelProperty(newModel.model.id, false, "isDirty"));
      await dispatch(initBrowserSettings(newModel.model.type));
    } finally {
      await dispatch(finishTransaction(true));
    }
  };
};

export function fetchRestore(restore) {
  return async (dispatch) => {
    await dispatch({
      type: FETCH_RESTORE,
      payload: restore
    });
  };
}

export const clearBackupModel = (ipcRenderer, sessionId) => {
  return async (dispatch, getState) => {
    ipcRenderer.send("restore:clearBackupModel", {
      sessionId
    });
  };
};
