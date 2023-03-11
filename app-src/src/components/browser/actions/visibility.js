import {
  finishTransaction,
  getCurrentHistoryTransaction,
  startTransaction
} from "../../../actions/undoredo";
import {
  getActiveDiagramAvailableNotes,
  getActiveDiagramAvailableOtherObjects,
  getActiveDiagramAvailableTables
} from "../../../selectors/selector_diagram";

import { ObjectType } from "../../../enums/enums";
import { UndoRedoDef } from "../../../helpers/history/undo_redo_transaction_defs";
import { pathByObjecType } from "../../url_navigation";
import { removeFromSelection } from "../../../actions/selections";
import { updateNoteProperty } from "../../../actions/notes";
import { updateOtherObjectProperty } from "../../../actions/other_objects";
import { updateTableProperty } from "../../../actions/tables";

const VISIBLE_PROPERTY = "visible";
const TOGGLE_OBJECT_VISIBILITY_OPERATION = "toggleObjectVisibility";

const forceRenderOnToggleClick = (id) => {
  getCurrentHistoryTransaction().addResizeRequest({
    operation: TOGGLE_OBJECT_VISIBILITY_OPERATION,
    domToModel: true,
    objects: [id]
  });
};

const updateObjectPropertyByType = (objectType, id, value, propertyName) => {
  return (dispatch) => {
    switch (objectType) {
      case ObjectType.TABLE: {
        dispatch(updateTableProperty(id, value, propertyName));
        return;
      }
      case ObjectType.NOTE: {
        dispatch(updateNoteProperty(id, value, propertyName));
        return;
      }
      case ObjectType.OTHER_OBJECT: {
        dispatch(updateOtherObjectProperty(id, value, propertyName));
        return;
      }
    }
  };
};

const getActiveDiagramAvailableObjectsByType = (objectType, state) => {
  switch (objectType) {
    case ObjectType.TABLE:
      return getActiveDiagramAvailableTables(state);
    case ObjectType.NOTE:
      return getActiveDiagramAvailableNotes(state);
    case ObjectType.OTHER_OBJECT:
      return getActiveDiagramAvailableOtherObjects(state);
    default:
      return [];
  }
};

export const toggleObjectVisibility = (historyContext, id, objectType) => {
  return async (dispatch, getState) => {
    const state = getState();
    await dispatch(
      startTransaction(
        historyContext,
        UndoRedoDef.BROWSER_ACTIONS_VISIBILITY__TOGGLE_OBJECT_VISIBILITY
      )
    );
    try {
      const objects = getActiveDiagramAvailableObjectsByType(objectType, state);
      const object = objects[id];
      const newVisibility = !object.visible;
      await dispatch(
        updateObjectPropertyByType(
          objectType,
          id,
          newVisibility,
          VISIBLE_PROPERTY
        )
      );
      if (!newVisibility) {
        await dispatch(removeFromSelection(id));
      }

      forceRenderOnToggleClick(id);

      if (objects.visible) {
        pathByObjecType(historyContext, objectType, objects);
      }
    } finally {
      await dispatch(finishTransaction());
    }
  };
};
