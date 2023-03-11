import {
  finishTransaction,
  getCurrentHistoryTransaction,
  startTransaction
} from "./undoredo";
import {
  getDiagramItemElement,
  mergeChangesOriginal,
  updateDiagramItemProperties
} from "./diagrams";

import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { getActiveDiagramObject } from "../selectors/selector_diagram";

export function alignItems1(side, value, isMax) {
  return async (dispatch, getState) => {
    if (_.size(getState().selections) > 0) {
      const changes = _.filter(
        _.map(getState().selections, (sel) => {
          const list = diagramItems(getState());
          if (list) {
            const obj = list[sel.objectId];
            if (obj) {
              return createChanges(sel, side, obj, getState, value, isMax);
            }
          }
          return {};
        }),
        (item) => item.newState
      );

      await dispatch(executeChanges(changes));
    }
  };
}

function createChanges(selection, side, obj, getState, value, isMax) {
  const originalState = {
    id: selection.objectId,
    propname: side,
    propvalue: side === "x" ? obj.x : obj.y,
    diagramId: getState().model.activeDiagram
  };
  const newValue = calculateNewValue(value, isMax, side, obj);
  return originalState.propvalue !== newValue
    ? {
        newState: {
          id: selection.objectId,
          propname: side,
          propvalue: newValue,
          diagramId: getState().model.activeDiagram
        },
        originalState
      }
    : {};
}

function diagramItems(state) {
  return state.diagrams[state.model.activeDiagram].diagramItems;
}

function calculateNewValue(value, isMax, side, obj) {
  if (isMax === true) {
    return side === "x" ? value - obj.gWidth : value - obj.gHeight;
  } else if (isMax === "middle") {
    return side === "x" ? value - obj.gWidth / 2 : value - obj.gHeight / 2;
  }
  return value;
}

function executeChanges(changes) {
  return async (dispatch, getState) => {
    if (changes.length > 0) {
      await dispatch(
        updateDiagramItemProperties({
          changes: changes.map((change) => change.newState)
        })
      );
    }
  };
}

export function alignItems(historyContext, alignTo) {
  return async (dispatch, getState) => {
    const state = getState();
    const selections = state.selections;
    const activeDiagramObject = getActiveDiagramObject(state);
    const diagramItems = activeDiagramObject.diagramItems;
    if (_.size(selections) > 0) {
      var side = "x";
      var value = 50;
      var xleft = [];
      var xright = [];
      var ytop = [];
      var ybottom = [];
      var isMax = false;

      _.forEach(selections, (sel) => {
        const obj = diagramItems[sel.objectId];
        if (obj) {
          xleft = [...xleft, obj.x];
          xright = [...xright, obj.x + obj.gWidth];
          ytop = [...ytop, obj.y];
          ybottom = [...ybottom, obj.y + obj.gHeight];
        }
      });

      if (alignTo === "left") {
        side = "x";
        value = Math.min(...xleft);
      } else if (alignTo === "right") {
        side = "x";
        value = Math.max(...xright);
        isMax = true;
      } else if (alignTo === "top") {
        side = "y";
        value = Math.min(...ytop);
      } else if (alignTo === "hcenter") {
        side = "x";
        value =
          Math.min(...xleft) + (Math.max(...xright) - Math.min(...xleft)) / 2;
        isMax = "middle";
      } else if (alignTo === "vcenter") {
        side = "y";
        value =
          Math.min(...ytop) + (Math.max(...ybottom) - Math.min(...ytop)) / 2;
        isMax = "middle";
      } else {
        side = "y";
        value = Math.max(...ybottom);
        isMax = true;
      }

      await dispatch(
        startTransaction(historyContext, UndoRedoDef.TOOLBAR__ALIGN_ITEMS)
      );
      try {
        await dispatch(alignItems1(side, value, isMax));
      } finally {
        await dispatch(finishTransaction());
      }
    }
  };
}

export function resizeItems1(side, newValue) {
  return (dispatch, getState) => {
    const propname = side === "width" ? "gWidth" : "gHeight";
    if (_.size(getState().selections) > 0) {
      const result = _.map(getState().selections, (sel) => {
        const diagramItem =
          getState().diagrams[getState().model.activeDiagram].diagramItems[
            sel.objectId
          ];
        const currentValue = diagramItem[propname];
        return [
          ...(currentValue !== newValue
            ? [
                {
                  newState: {
                    id: sel.objectId,
                    propname,
                    propvalue: newValue,
                    diagramId: getState().model.activeDiagram
                  }
                }
              ]
            : []),
          ...(currentValue !== newValue && !currentValue.resized
            ? [
                {
                  newState: {
                    id: sel.objectId,
                    propname: "resized",
                    propvalue: !currentValue.resized,
                    diagramId: getState().model.activeDiagram
                  }
                }
              ]
            : [])
        ];
      }).reduce((r, i) => (i ? [...r, ...i] : r), []);

      if (result.length > 0) {
        dispatch(
          updateDiagramItemProperties({
            changes: result.map((change) => change.newState)
          })
        );
      }
    }
  };
}

export async function resizeItems(historyContext, prop, minMax) {
  return async (dispatch, getState) => {
    const state = getState();
    const selections = state.selections;
    const activeDiagramObject = getActiveDiagramObject(state);
    if (_.size(selections) > 0) {
      var gw = [];
      var gh = [];
      var value;

      _.map(selections, (sel) => {
        gw = [...gw, activeDiagramObject.diagramItems[sel.objectId].gWidth];
        gh = [...gh, activeDiagramObject.diagramItems[sel.objectId].gHeight];
      });
      if (prop === "width") {
        if (minMax === "max") {
          value = Math.max(...gw);
        } else {
          value = Math.min(...gw);
        }
      } else {
        if (minMax === "max") {
          value = Math.max(...gh);
        } else {
          value = Math.min(...gh);
        }
      }
      await dispatch(
        startTransaction(historyContext, UndoRedoDef.TOOLBAR__RESIZE_ITEMS)
      );
      try {
        await dispatch(resizeItems1(prop, value));
      } finally {
        await dispatch(finishTransaction());
      }
    }
  };
}

export async function autoSize(historyContext) {
  return async (dispatch, getState) => {
    const selections = getState().selections;
    if (_.size(selections) > 0) {
      const selected = _.map(selections, (obj) => obj.objectId);
      await dispatch(
        startTransaction(
          historyContext,
          UndoRedoDef.TOOLBAR__SWITCH_LOCK_DIMENSIONS
        )
      );
      try {
        await dispatch(switchLockDimensions(selected, true));
      } finally {
        await dispatch(finishTransaction());
      }
    }
  };
}

export async function lockDimensions(historyContext) {
  return async (dispatch, getState) => {
    const selections = getState().selections;
    if (_.size(selections) > 0) {
      const selected = _.map(selections, (obj) => obj.objectId);
      await dispatch(
        startTransaction(
          historyContext,
          UndoRedoDef.TOOLBAR__SWITCH_LOCK_DIMENSIONS
        )
      );
      try {
        await dispatch(switchLockDimensions(selected, false));
      } finally {
        await dispatch(finishTransaction());
      }
    }
  };
}

export function switchLockDimensions(selection, autoSize) {
  return async (dispatch, getState) => {
    const state = getState();
    const diagram = state.diagrams[state.model.activeDiagram];
    const selectedDiagramItems = selection
      .filter((id) => !!diagram.diagramItems[id])
      .map((id) => diagram.diagramItems[id]);
    const lockDimensionsItems = selectedDiagramItems.filter(
      (item) => item.resized === autoSize
    );

    const allChanges = lockDimensionsItems
      .map((item) => {
        return {
          changes: [
            {
              id: item.referencedItemId,
              propname: "resized",
              propvalue: !autoSize,
              diagramId: state.model.activeDiagram
            }
          ]
        };
      })
      .reduce(mergeChangesOriginal, {});

    if (allChanges.changes?.length > 0) {
      allChanges.changes.forEach((change) => {
        if (change.propname === "resized") {
          const element = getDiagramItemElement(change.id);
          if (element) {
            if (change.propvalue === true) {
              element.style.width = `${element.clientWidth}px`;
            } else {
              element.style.width = "fit-content";
              element.style.height = "fit-content";
            }
          }
        }
      });
      await dispatch(
        updateDiagramItemProperties({ changes: allChanges.changes })
      );

      getCurrentHistoryTransaction().addResizeRequest({
        domToModel: true,
        operation: "switchLockDimensions",
        autoExpand: !autoSize,
        objects: [allChanges.changes.map((change) => change.id)]
      });
    }
  };
}
