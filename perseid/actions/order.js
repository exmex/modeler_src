import {
  getOrderedObjects,
  getOrderedObjectsForNewObject,
  getOrderedObjectsReset
} from "../selectors/selector_order";

import arrayMove from "array-move";

export const GROUPS = {
  OTHER_GROUP: 0,
  OTHER_TYPE_GROUP: 1,
  ENUM_GROUP: 2,
  DOMAIN_GROUP: 3,
  COMPOSITE_GROUP: 4,
  SEQUENCE_GROUP: 5,
  TABLE_GROUP: 6,
  RELATION_GROUP: 7,
  FUNCTION_GROUP: 8,
  PROCEDURE_GROUP: 9,
  VIEW_GROUP: 10,
  MATERIALIZED_VIEW_GROUP: 11,
  TRIGGER_GROUP: 12,
  RULE_GROUP: 13,
  POLICY_GROUP: 14,
  LINE_GROUP: 15
};

export const SET_ORDER = "set_order";
export const REMOVE_FROM_ORDER = "remove_from_order";
export const IMPORT_ORDER = "import_order";

export function exchangeOrder(type, oldIndex, newIndex) {
  return async (dispatch, getState) => {
    let currentOrderIds = getState().order;
    if (!Array.isArray(currentOrderIds) || currentOrderIds.length === 0) {
      currentOrderIds = getOrderedObjects(type)(getState()).map(
        (obj) => obj.id
      );
    }
    const newOrderIds = arrayMove(currentOrderIds, oldIndex, newIndex);

    await dispatch(setOrder(newOrderIds));
  };
}

export function updateOrderForNewObject(modelType) {
  return async (dispatch, getState) => {
    const newOrderIds = getOrderedObjectsForNewObject(modelType)(
      getState()
    ).map((obj) => obj.id);
    dispatch(updateOrder(newOrderIds));
  };
}

export function updateOrder(newOrderIds) {
  return async (dispatch) => {
    await dispatch(setOrder(newOrderIds));
  };
}

export function removeFromOrder(id) {
  return {
    type: REMOVE_FROM_ORDER,
    payload: id
  };
}

function isPureTable(model, id) {
  const tableObject = model.tables[id];
  return (
    tableObject &&
    (tableObject.objectType === undefined ||
      tableObject.objectType !== "composite")
  );
}

function isComposite(model, id) {
  const tableObject = model.tables[id];
  return tableObject?.objectType === "composite";
}

export function resetOrderOfTables(model) {
  const newOrderObjectList = getOrderedObjectsReset(model.model.type)(model);

  const firstTableListIndex = model.order.reduce(
    (minPureTableIndex, id, index) => {
      if (isPureTable(model, id)) {
        return index < minPureTableIndex ? index : minPureTableIndex;
      }
      return minPureTableIndex;
    },
    Number.MAX_SAFE_INTEGER
  );
  const newOrderTables = newOrderObjectList
    .filter((obj) => isPureTable(model, obj.id))
    .map((obj) => obj.id);
  const newOrder = model.order.filter((id) => !isPureTable(model, id));
  newOrder.splice(firstTableListIndex, 0, ...newOrderTables);
  return newOrder;
}

export function resetOrderOfComposites(model) {
  const newOrderObjectList = getOrderedObjectsReset(model.model.type)(model);

  const firstCompositeListIndex = model.order.reduce(
    (minCompositeIndex, id, index) => {
      if (isComposite(model, id)) {
        return index < minCompositeIndex ? index : minCompositeIndex;
      }
      return minCompositeIndex;
    },
    Number.MAX_SAFE_INTEGER
  );
  const newOrderComposites = newOrderObjectList
    .filter((obj) => isComposite(model, obj.id))
    .map((obj) => obj.id);
  const newOrder = model.order.filter((id) => !isComposite(model, id));
  newOrder.splice(firstCompositeListIndex, 0, ...newOrderComposites);
  return newOrder;
}

export function setOrder(newOrder) {
  return (dispatch) => {
    dispatch({
      type: SET_ORDER,
      payload: newOrder
    });
  };
}

export function resetOrder(type) {
  return async (dispatch, getState) => {
    const newOrderIds = getOrderedObjectsReset(type)(getState()).map(
      (obj) => obj.id
    );
    await dispatch(setOrder(newOrderIds));
  };
}

export function importOrder(order) {
  return {
    type: IMPORT_ORDER,
    payload: order
  };
}
