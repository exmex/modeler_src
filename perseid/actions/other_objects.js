import { removeFromOrder, updateOrderForNewObject } from "./order";

import { deleteAllDiagramItems } from "./diagrams";
import { deleteLine } from "./lines";
import { getCurrentHistoryTransaction } from "./undoredo";
import { updateMissingDataType } from "./tables";

export const FETCH_OTHER_OBJECTS = "fetch_other_objects";
export const FETCH_OTHER_OBJECT = "fetch_other_object";
export const ADD_OTHER_OBJECT = "add_other_object";
export const DELETE_OTHER_OBJECT = "delete_other_object";
export const CLEAR_OTHER_OBJECTS = "clear_other_objects";
export const IMPORT_OTHER_OBJECTS = "import_other_objects";
export const COPY_SELECTED_OTHER_OBJECTS = "copy_selected_other_objects";
export const DELETE_SELECTED_OTHER_OBJECTS = "delete_selected_other_objects";
export const UPDATE_OTHER_OBJECT_PROPERTY = "update_other_object_property";
export const UPDATE_OTHER_OBJECT_PROPERTIES = "update_other_object_properties";

export function importOtherObjects(otherObjects) {
  return {
    type: IMPORT_OTHER_OBJECTS,
    payload: otherObjects
  };
}

export function clearOtherObjects() {
  return {
    type: CLEAR_OTHER_OBJECTS
  };
}

export function deleteLines(linesIds) {
  return async (dispatch) => {
    for (const id of linesIds) {
      await dispatch(deleteLine(id));
    }
  };
}

export function deleteOtherObject(id) {
  return async (dispatch, getState) => {
    await dispatch(removeFromOrder(id));
    await dispatch(deleteLines(getState().otherObjects[id].lines));
    await dispatch(deleteAllDiagramItems(id));
    await dispatch(updateMissingDataType(id));

    await dispatch({
      type: DELETE_OTHER_OBJECT,
      payload: id
    });
  };
}

export function addOtherObject(otherObject) {
  return (dispatch, getState) => {
    dispatch({
      type: ADD_OTHER_OBJECT,
      payload: otherObject
    });
    dispatch(updateOrderForNewObject(getState().model.type));
  };
}

export function updateOtherObjectProperty(otherObjectId, newValue, pName) {
  return async (dispatch, getState) => {
    await dispatch({
      type: UPDATE_OTHER_OBJECT_PROPERTY,
      payload: { otherObjectId, newValue, pName }
    });

    getCurrentHistoryTransaction().addResizeRequest({
      domToModel: true,
      operation: "updateOtherObjectProperty",
    });
  };
}

export function updateOtherObjectProperties(objectProperties) {
  return async (dispatch, getState) => {
    await dispatch({
      type: UPDATE_OTHER_OBJECT_PROPERTIES,
      payload: objectProperties
    });
  };
}

export function fetchOtherObject(otherObject) {
  return async (dispatch) => {
    await dispatch({
      type: FETCH_OTHER_OBJECT,
      payload: otherObject
    });
  };
}
