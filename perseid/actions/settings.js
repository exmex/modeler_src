import { TYPE, addNotificationSimple } from "./notifications";
import {
  clearUnsavedModifications,
  finishTransaction,
  startTransaction,
} from "./undoredo";
import { loadModel, updateModelProperty } from "./model";

import { BackupModelTime } from "../enums/enums";
import ModelBuilder from "../helpers/autolayout/model-builder";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import { v4 as uuidv4 } from "uuid";

export const UPDATE_SETTINGS_PROPERTY = "update_settings_property";
export const FETCH_SETTINGS = "fetch_settings";
const SECOND_IN_MS = 1000;
const MINUTE_IN_MS = 1000 * 60;

const ipcRenderer = window?.ipcRenderer;

export function updateSettingsProperty(newValue, pName) {
  return (dispatch, getState) => {
    dispatch({
      type: UPDATE_SETTINGS_PROPERTY,
      payload: { newValue, pName },
    });
  };
}

export function fetchSettings(settings) {
  return (dispatch, getState) => {
    dispatch({
      type: FETCH_SETTINGS,
      payload: settings,
    });
  };
}

let backupTimer;
const UNSAVED_MODEL_PROPERTY = "unsavedModel";
const SETTINGS_SAVE_EVENT = "settings:save";
const BACKUP_MODEL_SAVE_EVENT = "backupModel:save";
const BACKUP_MODEL_CLEAR_EVENT = "backupModel:clear";
const BACKUP_MODEL_CLEAR_COMPLETED_EVENT = "backupModel:clearCompleted";
const BACKUP_MODEL_RESTORE_EVENT = "backupModel:restore";
const BACKUP_MODEL_RESTORE_COMPLETED_EVENT = "backupModel:restoreCompleted";

const createNewUnsavedModelPath = () => uuidv4();

export function handleBackupModelChange(oldBackupModelTime) {
  return async (dispatch, getState) => {
    if (oldBackupModelTime !== getState().settings.backupModelTime) {
      if (backupTimer !== undefined) {
        clearInterval(backupTimer);
        await dispatch(clearBackupModel());
      }
      if (shouldBackupModel(getState) === true) {
        await dispatch(startBackupModel());
      }
    }
  };
}

function convertSettingsToTime(backupModelTime) {
  switch (backupModelTime) {
    case BackupModelTime.NEVER:
      return 0;
    case BackupModelTime.FIVE_SECONDS:
      return 5 * SECOND_IN_MS;
    case BackupModelTime.MINUTE:
      return MINUTE_IN_MS;
    case BackupModelTime.FIVE_MINUTES:
      return 5 * MINUTE_IN_MS;
  }
}

function startBackupModel() {
  return async (dispatch, getState) => {
    backupTimer = setInterval(async () => {
      if (getState().undoRedo.unsavedModifications === true) {
        let unsavedModel = getState().settings.unsavedModel;
        const unsavedModelPath = unsavedModel
          ? unsavedModel.path
          : createNewUnsavedModelPath();
        await dispatch(updateBackupModelInfo(unsavedModelPath));
        if (ipcRenderer) {
          const modelText = buildModel(getState());
          ipcRenderer?.send(BACKUP_MODEL_SAVE_EVENT, {
            unsavedModelPath,
            modelText,
          });
        }
        await dispatch(clearUnsavedModifications());
      }
    }, convertSettingsToTime(getState().settings.backupModelTime));
  };
}

function buildModel(state) {
  const modelBuilder = new ModelBuilder();
  return modelBuilder.build({
    tables: state.tables,
    relations: state.relations,
    notes: state.notes,
    lines: state.lines,
    model: state.model,
    otherObjects: state.otherObjects,
    diagrams: state.diagrams,
    order: state.order,
  });
}

function updateBackupModelInfo(unsavedModelPath) {
  return async (dispatch, getState) => {
    const updatedUnsavedModel = {
      path: unsavedModelPath,
      model: {
        id: getState().model.id,
        name: getState().model.name,
        type: getState().model.type,
        lastSaved: getState().model.lastSaved,
        lastSavedBackup: new Date().toLocaleString(),
      },
    };
    await dispatch(
      updateSettingsProperty(updatedUnsavedModel, UNSAVED_MODEL_PROPERTY)
    );
    saveSettings(getState().settings);
  };
}

export function saveSettings(settings) {
  ipcRenderer && ipcRenderer.send(SETTINGS_SAVE_EVENT, settings);
}

function shouldBackupModel(getState) {
  return getState().settings.backupModelTime !== "never";
}

export function clearBackupModel() {
  return async (dispatch, getState) => {
    const unsavedModel = getState().settings.unsavedModel;
    if (unsavedModel) {
      await dispatch(updateSettingsProperty(undefined, UNSAVED_MODEL_PROPERTY));

      const backupModelClearPromise = new Promise((resolve, reject) => {
        ipcRenderer?.once(BACKUP_MODEL_CLEAR_COMPLETED_EVENT, (event) => {
          resolve();
        });
        ipcRenderer?.send(BACKUP_MODEL_CLEAR_EVENT, {
          unsavedModelPath: unsavedModel.path,
          settingsState: getState().settings,
        });
      });
      await backupModelClearPromise;
    }
  };
}

export function restoreBackupModel(historyContext) {
  return async (dispatch, getState) => {
    const unsavedModel = getState().settings.unsavedModel;
    if (unsavedModel) {
      ipcRenderer?.once(
        BACKUP_MODEL_RESTORE_COMPLETED_EVENT,
        async (event, { modelText, error }) => {
          if (error) {
            await dispatch(
              addNotificationSimple(
                `Model restore failed.`,
                TYPE.ERROR,
                false,
                null,
                null,
                false
              )
            );
            return;
          }
          const model = JSON.parse(modelText);
          await dispatch(
            startTransaction(
              historyContext,
              UndoRedoDef.SETTINGS__RESTORE_BACKUP_MODEL
            )
          );
          try {
            await dispatch(loadModel(model, historyContext));
            await dispatch(
              updateModelProperty(model.model.id, true, "isDirty")
            );
          } finally {
            await dispatch(finishTransaction(true));
          }
        }
      );
      ipcRenderer?.send(BACKUP_MODEL_RESTORE_EVENT, {
        unsavedModelPath: unsavedModel.path,
        settingsState: getState().settings,
      });
    }
  };
}

export function storeSettings() {
  return async (dispatch, getState) => {
    ipcRenderer && ipcRenderer.send("settings:save", getState().settings);
  };
}
