import {
  getActiveDiagramNotes,
  getActiveDiagramOtherObjects,
  getActiveDiagramTables
} from "../selectors/selector_diagram";
import {
  navigateToItemUrl,
  navigateToNoteUrl,
  navigateToOtherObjectUrl
} from "../components/url_navigation";

import _ from "lodash";
import { setForcedRender } from "./ui";

export const ADD_TO_SELECTION = "add_to_selection";
export const CLEAR_ADD_TO_SELECTION = "clear_add_to_selection";
export const CLEAR_ADD_MULTIPLE_TO_SELECTION =
  "clear_add_multiple_to_selection";
export const REMOVE_FROM_SELECTION = "remove_from_selection";
export const CLEAR_SELECTION = "clear_selection";
export const ADD_ALL_TABLES_TO_SELECTION = "add_all_tables_to_selection";
export const ADD_ALL_NOTES_TO_SELECTION = "add_all_notes_to_selection";
export const ADD_VISIBLE_OTHER_OBJECTS_TO_SELECTION =
  "add_visible_other_objects_to_selection";
export const ADD_ALL_OTHER_OBJECTS_TO_SELECTION =
  "add_all_other_objects_to_selection";
export const ADD_VISIBLE_TABLES_TO_SELECTION =
  "add_filtered_tables_to_selection";
export const DELETE_SELECTION = "delete_selection";

export function deleteSelection() {
  return {
    type: DELETE_SELECTION
  };
}

function switchUrlToSelectedObject(
  currentUrl,
  history,
  modelId,
  diagramId,
  visibleObjects
) {
  const visibleTable = _.find(visibleObjects.visibleTables, () => true);
  if (visibleTable) {
    navigateToItemUrl(
      currentUrl,
      history,
      modelId,
      diagramId,
      visibleTable.id,
      visibleTable.embeddable
    );
  } else {
    const visibleOtherObject = _.find(
      visibleObjects.visibleOtherObjects,
      () => true
    );
    if (visibleOtherObject) {
      navigateToOtherObjectUrl(
        currentUrl,
        history,
        modelId,
        diagramId,
        visibleOtherObject.id
      );
    } else {
      const visibleNote = _.find(visibleObjects.visibleNotes, () => true);
      if (visibleNote) {
        navigateToNoteUrl(
          currentUrl,
          history,
          modelId,
          diagramId,
          visibleNote.id
        );
      }
    }
  }
}

export function addVisibleObjectsToSelection(
  currentUrl,
  history,
  modelId,
  diagramId
) {
  return async (dispatch, getState) => {
    const visibleObjects = {
      visibleTables: getActiveDiagramTables(getState()),
      visibleNotes: getActiveDiagramNotes(getState()),
      visibleOtherObjects: getActiveDiagramOtherObjects(getState())
    };

    switchUrlToSelectedObject(
      currentUrl,
      history,
      modelId,
      diagramId,
      visibleObjects
    );

    await dispatch({
      type: ADD_VISIBLE_TABLES_TO_SELECTION,
      payload: _.keys(visibleObjects.visibleTables)
    });
    await dispatch({
      type: ADD_ALL_NOTES_TO_SELECTION,
      payload: _.keys(visibleObjects.visibleNotes)
    });
    await dispatch({
      type: ADD_ALL_OTHER_OBJECTS_TO_SELECTION,
      payload: _.keys(visibleObjects.visibleOtherObjects)
    });

    await dispatch(setForcedRender({ domToModel: false }));
  };
}

export function clearAddToSelection(objectType, objectId) {
  return async (dispatch, getState) => {
    const selections = getState().selections;
    if (!(selections[objectId] && _.size(selections) === 1)) {
      await dispatch({
        type: CLEAR_ADD_TO_SELECTION,
        payload: { objectType: objectType, objectId: objectId }
      });
    }
  };
}

export function addToSelection(objectType, objectId) {
  return async (dispatch, getState) => {
    const selections = getState().selections;
    if (!selections[objectId]) {
      await dispatch({
        type: ADD_TO_SELECTION,
        payload: { objectType: objectType, objectId: objectId }
      });
    }
  };
}

export function clearAddMultipleToSelection(objectTypeIdTuples) {
  return async (dispatch) => {
    await dispatch({
      type: CLEAR_ADD_MULTIPLE_TO_SELECTION,
      payload: objectTypeIdTuples
    });
  };
}

export function removeFromSelection(objectId) {
  return async (dispatch, getState) => {
    const selections = getState().selections;
    if (selections[objectId]) {
      await dispatch({
        type: REMOVE_FROM_SELECTION,
        payload: objectId
      });
    }
  };
}

export function clearSelection(isLinkSelected) {
  return async (dispatch, getState) => {
    const selections = getState().selections;
    if (_.size(selections) > 0 || isLinkSelected) {
      await dispatch({
        type: CLEAR_SELECTION
      });
    }
  };
}
