import _ from "lodash";
import { fetchNote } from "./notes";
import { fetchOtherObject } from "./other_objects";
import { fetchTable } from "./tables";
import { removeFromOrder } from "./order";

export const FETCH_LINES = "fetch_lines";
export const FETCH_LINE = "fetch_line";
export const ADD_LINE = "add_line";
export const SET_LINE_VISIBILITY = "set_line_visibility";
export const DELETE_LINE = "delete_line";
export const CLEAR_LINES = "clear_lines";
export const IMPORT_LINES = "import_lines";
export const DELETE_LINES = "delete_lines";
export const UPDATE_LINE_PROPERTY = "update_line_property";

export function importLines(lines) {
  return {
    type: IMPORT_LINES,
    payload: lines
  };
}

export function clearLines() {
  return {
    type: CLEAR_LINES
  };
}

export function updateTable(object, objectType) {
  return async (dispatch) => {
    if (objectType === "table") await dispatch(fetchTable(object));
    else if (objectType === "note") {
      await dispatch(fetchNote(object));
    } else if (objectType === "other_object") {
      await dispatch(fetchOtherObject(object));
    }
  };
}

const removeLineFromObject = (objectId, lineId) => {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.tables[objectId]) {
      await dispatch(
        fetchTable(
          removeLineReferencesFromObject(state.tables[objectId], lineId)
        )
      );
    }
    if (state.notes[objectId]) {
      await dispatch(
        fetchNote(removeLineReferencesFromObject(state.notes[objectId], lineId))
      );
    }
    if (state.otherObjects[objectId]) {
      await dispatch(
        fetchOtherObject(
          removeLineReferencesFromObject(state.otherObjects[objectId], lineId)
        )
      );
    }
  };
};

const removeLineReferencesFromObject = (obj, lineId) => {
  if (obj?.lines) {
    if (obj.lines.includes(lineId)) {
      obj.lines = _.pull(obj.lines, lineId);
    }
  }
  return obj;
};

export function deleteLine(id) {
  return async (dispatch, getState) => {
    const state = getState();
    await dispatch(removeFromOrder(id));

    let lineObject = state.lines[id];

    if (!lineObject) {
      return;
    }

    await dispatch(removeLineFromObject(lineObject.parent, id));
    await dispatch(removeLineFromObject(lineObject.child, id));

    await dispatch({
      type: DELETE_LINE,
      payload: id
    });
  };
}

export function deleteLines(lines) {
  return {
    type: DELETE_LINES,
    payload: lines
  };
}

export function addLine(line) {
  return {
    type: ADD_LINE,
    payload: line
  };
}

export function fetchLine(line) {
  return async (dispatch) => {
    await dispatch({
      type: FETCH_LINE,
      payload: line
    });
  };
}

export function updateLineProperty(lineId, newValue, pName) {
  return async (dispatch, getState) => {
    await dispatch({
      type: UPDATE_LINE_PROPERTY,
      payload: { lineId, newValue, pName }
    });
  };
}
