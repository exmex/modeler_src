import { deleteAllDiagramItems } from "./diagrams";
import { deleteLine } from "./lines";
import { getCurrentHistoryTransaction } from "./undoredo";

export const FETCH_NOTES = "fetch_notes";
export const FETCH_NOTE = "fetch_note";
export const ADD_NOTE = "add_note";
export const DELETE_NOTE = "delete_note";
export const CLEAR_NOTES = "clear_notes";
export const IMPORT_NOTES = "import_notes";
export const COPY_SELECTED_NOTES = "copy_selected_notes";
export const DELETE_SELECTED_NOTES = "delete_selected_notes";
export const UPDATE_NOTE_PROPERTY = "update_note_property";
export const UPDATE_NOTE_PROPERTIES = "update_note_properties";

export function importNotes(notes) {
  return {
    type: IMPORT_NOTES,
    payload: notes
  };
}

export function clearNotes() {
  return {
    type: CLEAR_NOTES
  };
}

export function deleteLines(lines) {
  return async (dispatch) => {
    if (lines) {
      for (var l of lines) {
        await dispatch(deleteLine(l));
      }
    }
  };
}

export function deleteNote(id) {
  return async (dispatch, getState) => {
    await dispatch(deleteLines(getState().notes[id].lines));
    await dispatch(deleteAllDiagramItems(id));
    dispatch({
      type: DELETE_NOTE,
      payload: id
    });
  };
}

export function addNote(note) {
  return {
    type: ADD_NOTE,
    payload: note
  };
}

export function updateNoteProperty(noteId, newValue, pName) {
  return async (dispatch, getState) => {
    await dispatch({
      type: UPDATE_NOTE_PROPERTY,
      payload: { noteId, newValue, pName }
    });

    const isNoteAutoSized =
      getState().diagrams[getState().model.activeDiagram].diagramItems[noteId]
        ?.resized === false;
    if (pName === "desc" && isNoteAutoSized === true) {
      getCurrentHistoryTransaction().addResizeRequest({
        domToModel: true,
        operation: "updateNoteProperty",
        objects: [noteId]
      });
    }
  };
}

export function fetchNote(note) {
  return async (dispatch) => {
    await dispatch({
      type: FETCH_NOTE,
      payload: note
    });
  };
}
