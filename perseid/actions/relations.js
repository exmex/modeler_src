import {
  fetchTable,
  removeColumnFromKey,
  updateChildColumnFkProperty
} from "./tables";
import { removeFromOrder, updateOrderForNewObject } from "./order";

import { ModelTypes } from "../enums/enums";
import _ from "lodash";
import { getCurrentHistoryTransaction } from "./undoredo";

export const FETCH_RELATIONS = "fetch_relations";
export const FETCH_RELATION = "fetch_relation";
export const ADD_RELATION = "add_relation";
export const SET_RELATION_VISIBILITY = "set_relation_visibility";
export const DELETE_RELATION = "delete_relation";
export const CLEAR_RELATIONS = "clear_relations";
export const IMPORT_RELATIONS = "import_relations";
export const UPDATE_RELATION_PROPERTY = "update_relation_property";
export const FETCH_RELATION_KEY_COLUMN_PAIR = "fetch_relation_key_column_pair";
export const DELETE_RELATION_KEY_COLUMN_PAIR =
  "delete_relation_key_column_pair";

export const CHANGE_USED_KEY = "change_used_key";
export const CHANGE_CHILD_COLUMN_MAPPING = "change_child_column_mapping";

export function fetchRelationKeyColumnPair(pair, relationId, position) {
  return {
    type: FETCH_RELATION_KEY_COLUMN_PAIR,
    payload: { pair, relationId, position }
  };
}

export function deleteRelationKeyColumnPair(relationId, position) {
  return {
    type: DELETE_RELATION_KEY_COLUMN_PAIR,
    payload: { relationId, position }
  };
}

export function importRelations(relations) {
  return {
    type: IMPORT_RELATIONS,
    payload: relations
  };
}

export function clearRelations() {
  return {
    type: CLEAR_RELATIONS
  };
}

function isSelfRelation(parentTable, childTable) {
  return childTable.id === parentTable.id;
}

function isInDeletingRelation(rel, col) {
  return !!rel.cols.find((relColPair) => relColPair.childcol === col.id);
}

function isInOtherRelation(
  modelType,
  relations,
  relId,
  parentTableRelationsIds,
  childTableRelationsIds,
  col
) {
  const rel = relations[relId];
  if (modelType === ModelTypes.GRAPHQL && rel.type !== "identifying") {
    return false;
  }
  const relationObjects = _.filter(relations, (relObj) => {
    return (
      relId !== relObj.id &&
      (parentTableRelationsIds.includes(relObj.id) ||
        childTableRelationsIds.includes(relObj.id))
    );
  });
  return !!relationObjects.find(
    (relObj) =>
      !!relObj.cols.find(
        (relColPair) =>
          relColPair.parentcol === col.id || relColPair.childcol === col.id
      )
  );
}

export function deleteRelation(historyContext, relationId) {
  return async (dispatch, getState) => {
    const state = getState();
    await dispatch(removeFromOrder(relationId));

    const relations = state.relations;
    const relationObject = state.relations[relationId];
    const childTable = _.cloneDeep(state.tables[relationObject.child]);
    const parentTable = _.cloneDeep(state.tables[relationObject.parent]);
    let keyColsToRemove = [];

    const colsToRemove = childTable.cols.filter(
      (col) =>
        isInDeletingRelation(relationObject, col) &&
        !isInOtherRelation(
          state.model.type,
          state.relations,
          relationId,
          parentTable.relations,
          childTable.relations,
          col
        )
    );

    if (colsToRemove.length > 0) {
      keyColsToRemove = getKeyColsToRemove(childTable, colsToRemove);
      removeColsFromChildTableKeys(childTable, colsToRemove);
      removeColsFromChildTableIndexes(childTable, colsToRemove);
      removeColsFromChildTable(childTable, colsToRemove);
    }

    removeRelationsFromParentChildTables(childTable, relationId, parentTable);

    await dispatch(updateKeys(historyContext, keyColsToRemove));
    await dispatch(fetchTable(childTable));
    if (!isSelfRelation(parentTable, childTable)) {
      await dispatch(fetchTable(parentTable));
    }
    await dispatch({
      type: DELETE_RELATION,
      payload: relationId
    });
    for (const col of state.tables[relationObject.child].cols) {
      await dispatch(updateChildColumnFkProperty(relationObject.child, col.id));
    }
    getCurrentHistoryTransaction().addResizeRequest({
      domToModel: true,
      operation: "deleteRelation"
    });
  };
}

function removeRelationsFromParentChildTables(childTable, relId, parentTable) {
  if (
    childTable &&
    childTable.relations &&
    childTable.relations.includes(relId)
  ) {
    childTable.relations = _.pull(childTable.relations, relId);
  }

  if (!isSelfRelation(parentTable, childTable)) {
    parentTable.relations = _.pull(parentTable.relations, relId);
  }
}

function removeColsFromChildTable(childTable, colsToRemove) {
  childTable.cols = childTable.cols.filter(
    (col) => !colsToRemove.find((colToRemove) => colToRemove === col)
  );
}

function removeColsFromChildTableKeys(childTable, colsToRemove) {
  childTable.keys = childTable.keys.map((key) => ({
    ...key,
    cols: key.cols.filter(
      (colref) => !colsToRemove.find((col) => col.id === colref.colid)
    )
  }));
}

function removeColsFromChildTableIndexes(childTable, colsToRemove) {
  childTable.indexes = childTable.indexes.map((index) => ({
    ...index,
    cols: index.cols.filter(
      (colref) => !colsToRemove.find((col) => col.id === colref.colid)
    )
  }));
}

function getKeyColsToRemove(childTable, colsToRemove) {
  return colsToRemove
    .map((col) => ({
      col,
      keys: childTable.keys.filter((key) =>
        key.cols.find((keycol) => keycol.colid === col.id)
      )
    }))
    .reduce(
      (tableKeyColTuple, colKeyTuple) => [
        ...tableKeyColTuple,
        ...colKeyTuple.keys.map((key) => ({
          tableId: childTable.id,
          colId: colKeyTuple.col.id,
          keyId: key.id
        }))
      ],
      []
    );
}

export function updateKeys(historyContext, keyColsToRemove) {
  return async (dispatch) => {
    for (let keyColToRemove of keyColsToRemove) {
      await dispatch(
        removeColumnFromKey(
          historyContext,
          keyColToRemove.colId,
          keyColToRemove.tableId,
          keyColToRemove.keyId
        )
      );
    }
  };
}

export function fetchRelations() {
  return {
    type: FETCH_RELATIONS,
    payload: [
      {
        id: "3",
        visible: true,
        name: "customer-address",
        desc: "Customer data",
        parent: "1",
        child: "2",
        parent_key: "100",
        cols: [
          { pairid: "r4", parentcol: "1", childcol: "1" },
          { pairid: "r5", parentcol: "2", childcol: "2" }
        ],
        type: "identifying",
        ri_pu: "No action",
        ri_pd: "Restrict",
        c_mp: "true",
        c_mch: "false",
        c_cch: 0
      },
      {
        id: "2",
        visible: true,
        name: "customer-order",
        desc: "Address data",
        parent: "1",
        child: "3",
        parent_key: "100",
        cols: [
          { pairid: "r2", parentcol: "1", childcol: "1" },
          { pairid: "r3", parentcol: "2", childcol: "2" }
        ],
        type: "identifying",
        ri_pu: "No action",
        ri_pd: "Restrict",
        c_mp: "true",
        c_mch: "false",
        c_cch: 0
      },
      {
        id: "1",
        visible: true,
        name: "order-order_item",
        desc: "Order data",
        parent: "3",
        child: "4",
        parent_key: "300",
        cols: [{ pairid: "r1", parentcol: "11", childcol: "11" }],
        type: "non-identifying",
        ri_pu: "No action",
        ri_pd: "Restrict",
        c_mp: "true",
        c_mch: "false",
        c_cch: 0
      }
    ]
  };
}

export function addRelation(relation) {
  return async (dispatch, getState) => {
    await dispatch({
      type: ADD_RELATION,
      payload: relation
    });

    await dispatch(updateOrderForNewObject(getState().model.type));
    getCurrentHistoryTransaction().addResizeRequest({
      domToModel: true,
      operation: "addRelation"
    });
  };
}

export function fetchRelation(relation) {
  return async (dispatch) => {
    await dispatch({
      type: FETCH_RELATION,
      payload: relation
    });
  };
}

export function updateRelationProperty(relationId, newValue, pName) {
  return async (dispatch, getState) => {
    await dispatch({
      type: UPDATE_RELATION_PROPERTY,
      payload: { relationId, newValue, pName }
    });
  };
}
