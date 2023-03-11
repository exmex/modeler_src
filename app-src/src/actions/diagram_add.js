import { DiagramAreaMode } from "../enums/enums";
import { setDiagramAreaMode } from "./ui";

export function addNote() {
  return async (dispatch, getState) => {
    dispatch(setDiagramAreaMode(DiagramAreaMode.ADD_NOTE));
  };
}

export function addTextNote() {
  return async (dispatch, getState) => {
    dispatch(setDiagramAreaMode(DiagramAreaMode.ADD_TEXT_NOTE));
  };
}

export function addOtherObject(otherObjectType) {
  return async (dispatch, getState) => {
    dispatch(setDiagramAreaMode("add" + otherObjectType));
  };
}

export function addRelation() {
  return async (dispatch, getState) => {
    dispatch(setDiagramAreaMode(DiagramAreaMode.ADD_RELATION));
  };
}

export function addImplements() {
  return async (dispatch, getState) => {
    dispatch(setDiagramAreaMode(DiagramAreaMode.ADD_IMPLEMENTS));
  };
}

export function addLine() {
  return async (dispatch, getState) => {
    dispatch(setDiagramAreaMode(DiagramAreaMode.ADD_LINE));
  };
}

export function addRelationHas() {
  return async (dispatch, getState) => {
    dispatch(setDiagramAreaMode(DiagramAreaMode.ADD_RELATION_BELONGS));
  };
}
