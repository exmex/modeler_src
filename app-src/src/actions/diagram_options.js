import {
  finishTransaction,
  getCurrentHistoryTransaction,
  startTransaction
} from "./undoredo";

import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import { updateDiagramProperty } from "./diagrams";
import { updateModelProperty } from "./model";

export async function handleChangeModelLineGraphics(
  historyContext,
  activeDiagramObject
) {
  return async (dispatch, getState) => {
    await dispatch(
      startTransaction(
        historyContext,
        UndoRedoDef.TOOLBAR__CHANGE_MODEL_LINE_GRAPHICS
      )
    );
    try {
      const linegraphics = activeDiagramObject?.linegraphics;
      const lg = linegraphics === "basic" ? "detailed" : "basic";
      await dispatch(
        updateDiagramProperty(
          historyContext.state.diagramId,
          lg,
          "linegraphics"
        )
      );
    } finally {
      await dispatch(finishTransaction());
    }
  };
}

export async function changeSchemaDisplay(historyContext) {
  return async (dispatch, getState) => {
    const state = getState();
    const id = state.model.id;
    const schemaContainerIsDisplayed = state.model.schemaContainerIsDisplayed;
    await dispatch(
      startTransaction(historyContext, UndoRedoDef.TOOLBAR__SCHEMA_DISPLAY)
    );
    try {
      await dispatch(updateModelProperty(id, true, "isDirty"));
      await dispatch(
        updateModelProperty(
          id,
          !schemaContainerIsDisplayed,
          "schemaContainerIsDisplayed"
        )
      );
      getCurrentHistoryTransaction().addResizeRequest({
        domToModel: true,
        operation: "schemaContainerIsDisplayed",
        byUser: false
      });
    } finally {
      await dispatch(finishTransaction());
    }
  };
}

export async function toggleDisplayProperty(historyContext, propName) {
  return async (dispatch, getState) => {
    const state = getState();
    await dispatch(
      startTransaction(
        historyContext,
        UndoRedoDef.TOOLBAR__DISPLAY_TOGGLE_PROPERTY
      )
    );
    try {
      await dispatch(updateModelProperty(state.model.id, true, "isDirty"));
      await dispatch(
        updateModelProperty(state.model.id, !state.model[propName], propName)
      );
      getCurrentHistoryTransaction().addResizeRequest({
        domToModel: true,
        operation: "toggleDisplayProperty",
        byUser: false
      });
    } finally {
      await dispatch(finishTransaction());
    }
  };
}

export async function changeCardinalityDisplay(historyContext) {
  return async (dispatch, getState) => {
    const state = getState();
    await dispatch(
      startTransaction(historyContext, UndoRedoDef.TOOLBAR__CARDINALITY_DISPLAY)
    );
    try {
      await dispatch(updateModelProperty(state.model.id, true, "isDirty"));

      await dispatch(
        updateModelProperty(
          state.model.id,
          !state.model.cardinalityIsDisplayed,
          "cardinalityIsDisplayed"
        )
      );
      getCurrentHistoryTransaction().addResizeRequest({
        domToModel: true,
        operation: "cardinalityIsDisplayed",
        byUser: false
      });
    } finally {
      await dispatch(finishTransaction());
    }
  };
}

export async function changeEstimatedSizeDisplay(historyContext) {
  return async (dispatch, getState) => {
    const state = getState();
    await dispatch(
      startTransaction(
        historyContext,
        UndoRedoDef.TOOLBAR__ESTIMATED_SIZE_DISPLAY
      )
    );
    try {
      await dispatch(updateModelProperty(state.model.id, true, "isDirty"));

      await dispatch(
        updateModelProperty(
          state.model.id,
          !state.model.estimatedSizeIsDisplayed,
          "estimatedSizeIsDisplayed"
        )
      );
      getCurrentHistoryTransaction().addResizeRequest({
        domToModel: true,
        operation: "estimatedSizeIsDisplayed",
        byUser: false
      });
    } finally {
      await dispatch(finishTransaction());
    }
  };
}

export async function changeDisplayEmbeddedInParents(historyContext) {
  return async (dispatch, getState) => {
    const state = getState();
    await dispatch(
      startTransaction(
        historyContext,
        UndoRedoDef.TOOLBAR__DISPLAY_ENBEDDED_IN_PARENTS
      )
    );
    try {
      await dispatch(updateModelProperty(state.model.id, true, "isDirty"));
      await dispatch(
        updateModelProperty(
          state.model.id,
          !state.model.embeddedInParentsIsDisplayed,
          "embeddedInParentsIsDisplayed"
        )
      );
      getCurrentHistoryTransaction().addResizeRequest({
        domToModel: true,
        operation: "embeddedInParentsIsDisplayed",
        byUser: false
      });
    } finally {
      await dispatch(finishTransaction());
    }
  };
}
