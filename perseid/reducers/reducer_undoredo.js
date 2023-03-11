import {
  ADD_TO_HISTORY,
  ADD_TO_REDO,
  CLEAR_HISTORY,
  CLEAR_REDO,
  CLEAR_UNSAVED_MODIFICATIONS,
  REDO,
  SET_UNSAVED_MODIFICATIONS,
  UNDO
} from "../actions/undoredo";

import { CLEAR_MODEL } from "../actions/model";

const INITIAL_STATE = {
  past: [],
  future: [],
  pivotUndo: -1,
  pivotRedo: -1,
  unsavedModifications: false
};

function getIndexOfNthUndoStep(pastToPivot, undoSteps) {
  let currentUndoSteps = -1;
  for (let i = pastToPivot.length - 1; i >= 0; i--) {
    currentUndoSteps++;
    if (currentUndoSteps >= undoSteps) {
      return i;
    }
  }
  return -1;
}

function reduceToMaxUndoSteps(pastToPivot, undoSteps, pivotUndo) {
  const index = getIndexOfNthUndoStep(pastToPivot, undoSteps);
  const pastToPivotReduced =
    index >= 0 ? pastToPivot.slice(index + 1) : pastToPivot;
  const pivotUndoReduced = index >= 0 ? pivotUndo - (index + 1) : pivotUndo;
  return { pastToPivotReduced, pivotUndoReduced };
}

export default function (state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case CLEAR_UNSAVED_MODIFICATIONS:
      return {
        ...state,
        unsavedModifications: false
      };
    case SET_UNSAVED_MODIFICATIONS:
      return {
        ...state,
        unsavedModifications: true
      };
    case ADD_TO_HISTORY:
      const pastToPivot = state.past.filter(
        (item, index) => index <= state.pivotUndo
      );

      const { pastToPivotReduced, pivotUndoReduced } = reduceToMaxUndoSteps(
        pastToPivot,
        action.payload.undoSteps,
        state.pivotUndo
      );
      return {
        ...state,
        past: [...pastToPivotReduced, action.payload],
        pivotUndo: pivotUndoReduced + 1
      };
    case UNDO:
      const decreasePivotUndo = state.pivotUndo - 1;
      const increasePivotRedo = state.pivotRedo + 1;
      return {
        ...state,
        pivotUndo: decreasePivotUndo,
        pivotRedo: increasePivotRedo
      };
    case ADD_TO_REDO:
      return {
        ...state,
        future: [...state.future, action.payload]
      };
    case REDO:
      const increasePivotUndo = state.pivotUndo + 1;
      const decreasePivotRedo = state.pivotRedo - 1;
      return {
        ...state,
        pivotRedo: decreasePivotRedo,
        pivotUndo: increasePivotUndo
      };
    case CLEAR_REDO:
      return { ...state, future: [], pivotRedo: -1 };

    case CLEAR_HISTORY:
      return INITIAL_STATE;
    case CLEAR_MODEL:
      return INITIAL_STATE;
    default:
      return state;
  }
}
