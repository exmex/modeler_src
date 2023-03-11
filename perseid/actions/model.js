import {
  ACTION_PROVIDE_MODEL_CALL,
  initBrowserSettings,
  setChangeScroll,
  setDisplayMode,
  setUnsavedChangesModalAction,
  setZoom,
  toggleUnsavedChangesModal
} from "./ui";
import {
  CREATE_DIAGRAM,
  SET_DIAGRAM_SCROLL,
  getCurrentScroll,
  importDiagrams
} from "./diagrams";
import { IPCContext, createOpenAction } from "../helpers/ipc/ipc";
import { TYPE, addNotificationSimple } from "./notifications";
import {
  finishTransaction,
  getCurrentHistoryTransaction,
  startTransaction
} from "./undoredo";
import {
  importTables,
  updateMissingDataType,
  updateTableProperty
} from "./tables";

import { ModelIntegrationCheckBuilder } from "../helpers/model/model-integration-check";
import { ModelLoader } from "../helpers/model/model-loader";
import { ModelTypes } from "../enums/enums";
import { ModelUpgrader } from "../helpers/model/model-upgrader";
import TreeDiagramHelpers from "../helpers/tree_diagram/tree_diagram_helpers";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { checkLimit } from "../components/license_limitation";
import { clearBackupModel } from "./settings";
import { clearSelection } from "./selections";
import { fetchCollapsedTreeItems } from "./collapsed_tree_items";
import { getHistoryContext } from "../helpers/history/history";
import { importLines } from "./lines";
import { importNotes } from "./notes";
import { importOrder } from "./order";
import { importOtherObjects } from "./other_objects";
import { importRelations } from "./relations";
import { navigateToDiagramUrl } from "../components/url_navigation";
import { setLocalization } from "./localization";

export const LOAD_MODEL = "load_model";
export const FETCH_MODEL = "fetch_model";
export const CLEAR_MODEL = "clear_model";
export const IMPORT_MODEL = "import_model";
export const CREATE_MODEL = "create_model";
export const UPDATE_MODEL_PROPERTY = "update_model_property";
export const SHOW_DIAGRAM = "show_diagram";

export function updateModelProperty(modelId, newValue, pName) {
  return async (dispatch, getState) => {
    const shouldUpdateRemovedCustomDatatype =
      pName === "customDataTypes" &&
      _.size(newValue) < _.size(getState().model.customDataTypes);
    if (shouldUpdateRemovedCustomDatatype) {
      const removedCustomDatatype = _.xor(
        newValue,
        getState().model.customDataTypes
      );

      await dispatch(updateMissingDataType(removedCustomDatatype[0]));
    }
    await dispatch({
      type: UPDATE_MODEL_PROPERTY,
      payload: { modelId, newValue, pName }
    });
  };
}

export function importModelProperites(modelProperties) {
  return async (dispatch) => {
    await dispatch({
      type: IMPORT_MODEL,
      payload: modelProperties
    });
  };
}

export function loadModel(modelJson, historyContext) {
  return async (dispatch) => {
    await dispatch(clearModel());
    await dispatch(loadModelFromJson(modelJson, historyContext));
  };
}

function importModel(model, historyContext) {
  return async (dispatch, getState) => {
    const state = getState();
    await dispatch(importModelProperites(model.model));

    if (
      (model.model.type === ModelTypes.LOGICAL ||
        model.model.type === ModelTypes.GRAPHQL ||
        model.model.type === ModelTypes.MONGOOSE) &&
      state.ui.currentDisplayMode === "indexes"
    ) {
      await dispatch(setDisplayMode("metadata"));
    }

    await dispatch(importTables(model.tables, state.profile));
    await dispatch(importNotes(model.notes));
    if (model.otherObjects) {
      await dispatch(importOtherObjects(model.otherObjects));
    }
    if (model.lines) {
      await dispatch(importLines(model.lines));
    }
    if (model.order) {
      await dispatch(importOrder(model.order));
    }
    await dispatch(importRelations(model.relations));
    await dispatch(setLocalization(model.model.type));

    await dispatch(updateModelProperty(model.model.id, false, "isDirty"));

    await dispatch(importDiagrams(model.diagrams));
    await dispatch(
      showDiagram(
        model.model.id,
        model.model.activeDiagram,
        true,
        historyContext
      )
    );
    await dispatch(fetchCollapsedTreeItems(model.collapsedTreeItems));
  };
}

function upgradeModel(fixedJson) {
  return new ModelUpgrader().upgrade(fixedJson);
}

export function loadModelFromJson(inputJson, historyContext) {
  return async (dispatch) => {
    const upgradedJson = upgradeModel(inputJson);
    const fixedJson = fixModel(upgradedJson);
    await dispatch(importModel(fixedJson, historyContext));
  };
}

function fixModel(modelJson) {
  try {
    const check = new ModelIntegrationCheckBuilder(modelJson).build();
    const problems = check.check();
    return check.fix(problems);
  } catch (e) {
    // do not use fixed model if fails
    return modelJson;
  }
}

export function provideModel(historyContext, isDirty, ipcContext, parameters) {
  return async (dispatch) => {
    if (isDirty === true) {
      await dispatch(
        setUnsavedChangesModalAction({
          name: ACTION_PROVIDE_MODEL_CALL,
          historyState: historyContext.state,
          ipcAction: ipcContext.action,
          parameters
        })
      );
      await dispatch(toggleUnsavedChangesModal());
    } else {
      await dispatch(openModel(historyContext, ipcContext, parameters));
    }
  };
}

export function openModel(historyContext, ipcContext, parameters) {
  return async (dispatch) => {
    const modelLoader = new ModelLoader(historyContext, ipcContext, parameters);
    await dispatch(modelLoader.load());
  };
}

export function clearModel() {
  return (dispatch) => {
    dispatch({
      type: CLEAR_MODEL
    });
  };
}

export function createModel(model, diagram) {
  return async (dispatch) => {
    await dispatch(clearModel());
    await dispatch({
      type: CREATE_MODEL,
      payload: model
    });
    await dispatch({
      type: CREATE_DIAGRAM,
      payload: diagram
    });
    await dispatch(initBrowserSettings(model.type));
    await dispatch(setLocalization(model.type));
  };
}

export function fetchModel(model) {
  return async (dispatch) => {
    await dispatch({
      type: FETCH_MODEL,
      payload: model
    });
  };
}

export function showDiagram(modelId, diagramId, moveToStart, historyContext) {
  return async (dispatch, getState) => {
    const state = getState();
    const currentScroll = getCurrentScroll();
    if (state.diagrams[historyContext.state.diagramId]) {
      await dispatch({
        type: SET_DIAGRAM_SCROLL,
        payload: { id: historyContext.state.diagramId, scroll: currentScroll }
      });
    }
    await dispatch({
      type: SHOW_DIAGRAM,
      payload: diagramId
    });
    navigateToDiagramUrl(
      historyContext.state.url,
      historyContext.history,
      modelId,
      diagramId
    );
    await dispatch(clearSelection(true));

    getCurrentHistoryTransaction().addResizeRequest({
      domToModel: true,
      operation: "showDiagram"
    });

    if (!moveToStart) {
      const nextZoom = state.diagrams[diagramId].zoom;
      const nextChangeScroll = state.diagrams[diagramId].scroll;
      const currentZoom = state.ui.zoom;

      if (nextZoom !== currentZoom) {
        await dispatch(setZoom(nextZoom));
      }

      if (
        nextChangeScroll &&
        !(
          nextChangeScroll?.x === currentScroll?.x &&
          nextChangeScroll?.y === currentScroll?.y
        )
      ) {
        await dispatch(setChangeScroll(nextChangeScroll));
      }
    } else {
      await dispatch(setChangeScroll({ x: 0, y: 0 }));
    }
  };
}

export function showMainDiagram(historyContext) {
  return (dispatch, getState) => {
    const state = getState();
    const mainDiagram = _.find(state.diagrams, (diagram) => !!diagram.main);
    if (mainDiagram) {
      dispatch(
        showDiagram(state.model.id, mainDiagram.id, false, historyContext)
      );
    }
  };
}

function processResult(result, historyContext) {
  return async (dispatch) => {
    await dispatch(
      startTransaction(historyContext, UndoRedoDef.MODEL__PROCESS_RESULT)
    );
    try {
      await dispatch(loadModel(result.modelData, historyContext));

      await dispatch(
        updateModelProperty(
          result.modelData.model.id,
          result.filePath,
          "filePath"
        )
      );
      await dispatch(
        updateModelProperty(
          result.modelData.model.id,
          result.lastSaveDay.toString(),
          "lastSaved"
        )
      );
      await dispatch(
        updateModelProperty(result.modelData.model.id, false, "isDirty")
      );
      await dispatch(initBrowserSettings(result.modelData.model.type));
    } finally {
      await dispatch(finishTransaction(true));
    }
  };
}

function processResultLocalStorage(result, historyContext) {
  return async (dispatch) => {
    var dataToProcess = JSON.parse(result);
    var parsedModelData = dataToProcess.modelData;
    // previous storage form
    if (_.isString(parsedModelData)) {
      parsedModelData = JSON.parse(parsedModelData);
    }
    await dispatch(
      startTransaction(
        historyContext,
        UndoRedoDef.MODEL__PROCESS_RESULT_LOCAL_STORAGE
      )
    );
    try {
      await dispatch(loadModel(parsedModelData, historyContext));
      await dispatch(
        updateModelProperty(parsedModelData.model.id, false, "isDirty")
      );
      await dispatch(initBrowserSettings(parsedModelData.model.type));
    } finally {
      dispatch(finishTransaction(true));
    }
  };
}

export function openFromUrl(historyContext, ipcContext, { urlPath }, callback) {
  return async (dispatch) => {
    ipcContext.once(ipcContext.action.finishEvent, async (event, result) => {
      if (result.error) {
        await dispatch(
          addNotificationSimple(
            result.error,
            TYPE.ERROR,
            false,
            null,
            null,
            false
          )
        );
        callback(false);
      } else {
        await dispatch(processResult(result, historyContext));
        callback(true);
      }
    });
    ipcContext.send(ipcContext.action.startEvent, urlPath);
  };
}

export function reopenModel(historyContext, ipcContext, { filePath }) {
  return async (dispatch) => {
    if (ipcContext.isElectron()) {
      ipcContext.once(ipcContext.action.finishEvent, async (event, result) => {
        if (result.error) {
          await dispatch(
            addNotificationSimple(
              result.error,
              TYPE.ERROR,
              false,
              null,
              null,
              false
            )
          );
        } else {
          await dispatch(processResult(result, historyContext));
        }
      });
      ipcContext.send(ipcContext.action.startEvent, filePath);
    } else {
      const result = localStorage.getItem(filePath);
      await dispatch(processResultLocalStorage(result, historyContext));
    }
  };
}

export function updateSqlSettingsProperty(modelId, newValue, pName) {
  const SQL_SETTINGS_PROPERTY = "sqlSettings";

  return async (dispatch, getState) => {
    const newSqlSettings = {
      ...getState().model.sqlSettings,
      [pName]: newValue
    };
    await dispatch({
      type: UPDATE_MODEL_PROPERTY,
      payload: {
        modelId,
        newValue: newSqlSettings,
        pName: SQL_SETTINGS_PROPERTY
      }
    });
  };
}

export function updateJsonCodeSettingsProperty(modelId, newValue, pName) {
  const SETTINGS_PROPERTY = "jsonCodeSettings";

  return async (dispatch, getState) => {
    const newJsonCodeSettings = {
      ...getState().model.jsonCodeSettings,
      [pName]: newValue
    };
    await dispatch({
      type: UPDATE_MODEL_PROPERTY,
      payload: {
        modelId,
        newValue: newJsonCodeSettings,
        pName: SETTINGS_PROPERTY
      }
    });
  };
}

function getModelToStore(state) {
  return {
    tables: state.tables,
    relations: state.relations,
    notes: state.notes,
    lines: state.lines,
    model: state.model,
    otherObjects: state.otherObjects,
    diagrams: state.diagrams,
    order: state.order,
    collapsedTreeItems: state.collapsedTreeItems
  };
}

function getFormattedModelText(model) {
  return JSON.stringify(model, null, "\t");
}

function getMessageType(saveAs) {
  return saveAs === true ? "model:saveAs" : "model:save";
}

export function saveModel(ipcRenderer, saveAs, callback) {
  return async (dispatch, getState) => {
    await dispatch(
      fetchCollapsedTreeItems(TreeDiagramHelpers.getCollapsedNodes())
    );
    const state = getState();
    const messageType = getMessageType(saveAs);
    const modelToStore = getModelToStore(state);
    const modelToStoreText = getFormattedModelText(modelToStore);
    if (ipcRenderer) {
      if (checkLimit(state.profile, state.tables, false) === true) {
        await dispatch(
          addNotificationSimple(
            state.localization.TEXTS.FREEWARE_SAVE,
            TYPE.INFO,
            true
          )
        );
      } else {
        ipcRenderer.once("model:savedComplete", async (event, message) => {
          if (message.error) {
            await dispatch(
              addNotificationSimple(message.error, TYPE.ERROR, true)
            );
            callback(true);
          } else if (!message.cancel) {
            await dispatch(clearBackupModel());

            var model = _.cloneDeep(state.model);
            var dataToProcess = message;
            model.filePath = dataToProcess.filePath;
            model.lastSaved = dataToProcess.lastSaveDay;
            await dispatch(fetchModel(model));

            await dispatch(
              updateModelProperty(state.model.id, false, "isDirty")
            );

            callback(false);
          }
          return modelToStoreText;
        });
        ipcRenderer.send(messageType, modelToStoreText);
      }
    } else {
      const modelsListContent = JSON.parse(localStorage.getItem("dataxmodels"));

      const updatedModelsListContent = {
        ...modelsListContent,
        [state.model.name]: {
          filePath: state.model.name,
          modelId: state.model.id,
          modelName: state.model.name,
          modelDesc: state.model.desc,
          modelType: state.model.type,
          lastSaved: Date.now(),
          lastSavedDay: Date().toLocaleString()
        }
      };

      localStorage.setItem(
        "dataxmodels",
        JSON.stringify(updatedModelsListContent)
      );

      localStorage.setItem(
        state.model.name,
        JSON.stringify({
          modelId: state.model.name,
          modelData: modelToStore
        })
      );

      await dispatch(updateModelProperty(state.model.id, false, "isDirty"));
    }
  };
}

export function hideAllEmbeddable(history, match, hide) {
  return async (dispatch, getState) => {
    const state = getState();
    const embeddableTables = _.filter(state.tables, ["embeddable", true]);
    await dispatch(
      startTransaction(
        getHistoryContext(history, match),
        UndoRedoDef.MODEL__HIDE_ALL_EMBEDDABLE
      )
    );
    try {
      for (const embeddableTable of embeddableTables) {
        await dispatch(
          updateTableProperty(embeddableTable.id, hide, "visible")
        );
      }

      if (hide === true) {
        getCurrentHistoryTransaction().addResizeRequest({
          operation: "hideAllEmbeddable",
          objects: [embeddableTables.map((table) => table.id)]
        });
      }
    } finally {
      await dispatch(finishTransaction());
    }
  };
}

export function executeOpenAction(history, match) {
  return async (dispatch, getState) => {
    const state = getState();
    const historyContext = getHistoryContext(history, match);
    await dispatch(
      provideModel(
        historyContext,
        state.model?.isDirty ?? false,
        new IPCContext(createOpenAction()),
        {}
      )
    );
  };
}
