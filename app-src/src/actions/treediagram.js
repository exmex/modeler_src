import TreeDiagramHelpers from "../helpers/tree_diagram/tree_diagram_helpers";
import UIHelpers from "../helpers/ui_helpers";
import { updateModelProperty } from "./model";

export function expandAll() {
  return async (dispatch, getState) => {
    TreeDiagramHelpers.expandOrCollapseNodes(".tree__item__sub", null, true);
    UIHelpers.setFocusToCanvasAndKeepScrollPosition();
    dispatch(updateModelProperty(getState().model.id, true, "isDirty"));
  };
}

export function collapseAll() {
  return async (dispatch, getState) => {
    TreeDiagramHelpers.expandOrCollapseNodes(".tree__item__sub", null, false);
    UIHelpers.scrollToXandY(0, 0);
    dispatch(updateModelProperty(getState().model.id, true, "isDirty"));
  };
}
