import {
  MergeChangesFinish,
  MergeChangesStart
} from "../helpers/history/merge_changes.js";
import { getCurrentScroll, importDiagrams } from "./diagrams.js";
import { importModelProperites, showDiagram } from "./model";
import { setForcedRender, setZoom } from "./ui";

import { HistoryTransaction } from "../helpers/history/history.js";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs.js";
import _ from "lodash";
import { clearSelection } from "./selections.js";
import { importLines } from "./lines";
import { importNotes } from "./notes.js";
import { importOrder } from "./order.js";
import { importOtherObjects } from "./other_objects.js";
import { importRelations } from "./relations.js";
import { importTables } from "./tables.js";
import { isValid } from "common";
import { registerUndoId } from "../helpers/history/undo_logger.js";
import { updateModelProperty } from "./model.js";

export const ADD_TO_HISTORY = "add_to_history";
export const ADD_TO_REDO = "add_to_redo";
export const UNDO = "undo";
export const REDO = "redo";
export const CLEAR_REDO = "clear_redo";
export const CLEAR_HISTORY = "clear_history";
export const CLEAR_UNSAVED_MODIFICATIONS = "clear_unsaved_modifications";
export const SET_UNSAVED_MODIFICATIONS = "set_unsaved_modifications";

export function clearUnsavedModifications() {
  return (dispatch) => {
    dispatch({ type: CLEAR_UNSAVED_MODIFICATIONS });
  };
}
export function addToHistory(historyTransaction, difference) {
  return async (dispatch, getState) => {
    const state = getState();
    registerUndoId(state.model.type, historyTransaction.id);

    var ur = state.undoRedo;
    let lastItem = _.maxBy(ur.past, "id");
    let maxNumber = lastItem ? lastItem.id + 1 : 1;

    var stateToStore = {
      difference,
      id: maxNumber,
      undoName: historyTransaction.id,
      position: historyTransaction.position,
      undoSteps: state.settings.undoSteps
    };
    await dispatch({
      type: CLEAR_REDO
    });
    await dispatch({
      type: ADD_TO_HISTORY,
      payload: stateToStore
    });
    if (state.model.isDirty === false) {
      await dispatch(updateModelProperty(state.model.id, true, "isDirty"));
    }
    await dispatch({
      type: SET_UNSAVED_MODIFICATIONS
    });
  };
}

export function getModelState(state) {
  return {
    tables: state.tables,
    relations: state.relations,
    lines: state.lines,
    notes: state.notes,
    otherObjects: state.otherObjects,
    order: state.order,
    diagrams: state.diagrams,
    model: state.model
  };
}

function addToRedo(past) {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.undoRedo.future.length < state.undoRedo.past.length) {
      await dispatch({
        type: ADD_TO_REDO,
        payload: {
          id: past.id,
          undoName: past.undoName,
          difference: past.difference,
          position: {
            activeDiagram: state.model.activeDiagram,
            url: past.position.url,
            zoom: past.position.zoom
          }
        }
      });
    }
  };
}

const stores = [
  {
    name: "diagrams",
    import: importDiagrams
  },
  {
    name: "tables",
    import: importTables
  },
  {
    name: "relations",
    import: importRelations
  },
  {
    name: "lines",
    import: importLines
  },
  {
    name: "notes",
    import: importNotes
  },
  {
    name: "otherObjects",
    import: importOtherObjects
  },
  {
    name: "order",
    import: importOrder
  },
  {
    name: "model",
    import: importModelProperites
  }
];

export function undo(historyContext) {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.undoRedo.pivotUndo < 0) {
      return;
    }

    const past = state.undoRedo.past[state.undoRedo.pivotUndo];
    await dispatch(addToRedo(past));

    const modelState = getModelState(state);

    for (const store of stores) {
      const storeChanges = new MergeChangesStart(
        modelState,
        past.difference,
        store.name
      ).merge();

      if (storeChanges.changed === true) {
        await dispatch(store.import(storeChanges.newModel, state.profile));
      }
    }

    await dispatch(clearSelection(true));
    await dispatch(setForcedRender({ domToModel: false }));

    if (state.model.isDirty === false) {
      await dispatch(updateModelProperty(state.model.id, true, "isDirty"));
    }

    const current = past.position.activeDiagram;
    if (historyContext.state.diagramId !== current) {
      await dispatch(
        startTransaction(
          historyContext,
          UndoRedoDef.UNDOREDO__SHOW_DIAGRAM_UNDO
        )
      );
      try {
        const currentScroll = getCurrentScroll();
        await dispatch(
          showDiagram(
            historyContext.state.modelId,
            current,
            currentScroll,
            historyContext
          )
        );
      } finally {
        await dispatch(finishTransaction(true));
      }
    } else {
      historyContext.history.push(past.position.url);
    }
    const zoom = past.position.zoom;
    if (getState().ui.zoom !== zoom) await dispatch(setZoom(zoom, false));

    await dispatch({
      type: UNDO,
      undoName: past.undoName
    });
  };
}

export function redo(historyContext) {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.undoRedo.pivotRedo < 0) {
      return;
    }

    const future = state.undoRedo.future[state.undoRedo.pivotRedo];

    const modelState = getModelState(state);
    for (const store of stores) {
      const storeChanges = new MergeChangesFinish(
        modelState,
        future.difference,
        store.name
      ).merge();
      if (storeChanges.changed === true) {
        await dispatch(store.import(storeChanges.newModel, state.profile));
      }
    }
    await dispatch(
      startTransaction(historyContext, UndoRedoDef.UNDOREDO__SHOW_DIAGRAM_REDO)
    );
    try {
      const current = future.position.activeDiagram;
      if (historyContext.state.diagramId !== current) {
        await dispatch(
          showDiagram(
            historyContext.state.modelId,
            current,
            true,
            historyContext
          )
        );
      } else {
        historyContext.history.push(future.position.url);
      }
      const zoom = future.position.zoom;
      if (state.ui.zoom !== zoom) {
        await dispatch(setZoom(zoom, false));
      }

      await dispatch({
        type: REDO,
        undoName: future.undoName
      });
      getCurrentHistoryTransaction().addResizeRequest({});
    } finally {
      await dispatch(finishTransaction(true));
    }
  };
}

export function clearHistory() {
  return {
    type: CLEAR_HISTORY
  };
}

export let currentHistoryTransaction = undefined;
export function finishTransaction(skipHistory) {
  return async (dispatch, getState) => {
    await dispatch(currentHistoryTransaction.finish(skipHistory));
    currentHistoryTransaction = undefined;
    const state = getState();
    await isValid(state);
  };
}

export const startTransaction = (historyContext, id) => {
  return async (dispatch) => {
    currentHistoryTransaction = new HistoryTransaction(historyContext, id);
    await dispatch(currentHistoryTransaction.init());
  };
};

export const getCurrentHistoryTransaction = () => {
  return currentHistoryTransaction;
};
