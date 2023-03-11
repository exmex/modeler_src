import {
  ADD_COLUMN_TO_INDEX,
  ADD_COLUMN_TO_KEY,
  ADD_TABLE,
  CLEAR_TABLES,
  COPY_SELECTED_TABLES,
  DELETE_COLUMN,
  DELETE_COLUMN_BY_ID,
  DELETE_INDEX,
  DELETE_KEY,
  DELETE_TABLE,
  FETCH_COLUMN,
  FETCH_INDEX,
  FETCH_KEY,
  FETCH_TABLE,
  FETCH_TABLES,
  IMPORT_TABLES,
  REMOVE_COLUMN_FROM_INDEX,
  REMOVE_COLUMN_FROM_INDEX_BY_COLUMN_ID,
  REMOVE_COLUMN_FROM_KEY,
  REMOVE_EMPTY_FROM_KEY,
  UPDATE_COLUMN_PROPERTY,
  UPDATE_INDEX_COLUMN_PROPERTY,
  UPDATE_INDEX_PROPERTY,
  UPDATE_KEY_PROPERTY,
  UPDATE_TABLE_PROPERTIES,
  UPDATE_TABLE_PROPERTY
} from "../actions/tables";

import { CLEAR_MODEL } from "../actions/model";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";

const INITIAL_STATE = {};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case COPY_SELECTED_TABLES:
      var tableCopies = {};
      _.map(action.payload, (sel) => {
        var newObj = _.cloneDeep(state[sel.objectId]);
        if (newObj) {
          newObj.id = uuidv4();
          newObj.name += "_copy";
          newObj.x += 20;
          newObj.y += 20;
          newObj.relations = [];

          for (var c of newObj.cols) {
            var newColId = uuidv4();
            for (var k of newObj.keys) {
              for (var colInKey of k.cols) {
                if (colInKey.colid === c.id) {
                  colInKey.colid = newColId;
                }
              }
            }
            for (var ix of newObj.indexes) {
              for (var colInIx of ix.cols) {
                if (colInIx.colid === c.id) {
                  colInIx.colid = newColId;
                }
              }
            }

            c.id = newColId;
            c.fk = false;
          }
          //this.props.addTable(newObj);

          tableCopies = { ...tableCopies, [newObj.id]: newObj };
          newObj = null;
        }
      });

      return { ...state, ...tableCopies };

    case CLEAR_MODEL:
      //console.log("model cleared from reducer tables");
      return INITIAL_STATE;
    case IMPORT_TABLES:
      //console.log("state", state);
      //console.log("model imported from reducer tables");
      return action.payload.tables;

    case CLEAR_TABLES:
      return INITIAL_STATE;
    case DELETE_TABLE:
      return _.omit(state, action.payload.id);
    case ADD_TABLE:
      return { ...state, [action.payload.id]: action.payload };

    case ADD_COLUMN_TO_INDEX:
      var tableToUpdate1 = _.cloneDeep(state[action.payload.tableId]);
      var tableIndex = _.find(tableToUpdate1.indexes, [
        "id",
        action.payload.indexId
      ]);
      var newItem = { id: uuidv4(), colid: action.payload.columnId };
      tableIndex.cols = [...tableIndex.cols, newItem];
      return { ...state, [action.payload.tableId]: tableToUpdate1 };

    case REMOVE_COLUMN_FROM_INDEX:
      let tableToUpdate2 = _.cloneDeep(state[action.payload.tableId]);
      let tableIndex2 = _.find(tableToUpdate2.indexes, [
        "id",
        action.payload.indexId
      ]);
      tableIndex2.cols = _.reject(tableIndex2.cols, {
        id: action.payload.columnId
      });
      return { ...state, [action.payload.tableId]: tableToUpdate2 };

    case REMOVE_COLUMN_FROM_INDEX_BY_COLUMN_ID:
      let tableToUpdate6 = _.cloneDeep(state[action.payload.tableId]);
      let tableIndex6 = _.find(tableToUpdate6.indexes, [
        "id",
        action.payload.indexId
      ]);
      tableIndex6.cols = _.reject(tableIndex6.cols, {
        colid: action.payload.columnId
      });
      return { ...state, [action.payload.tableId]: tableToUpdate6 };

    case ADD_COLUMN_TO_KEY: {
      let tableToUpdate3 = _.cloneDeep(state[action.payload.tableId]);
      let tableKey = _.find(tableToUpdate3.keys, ["id", action.payload.keyId]);
      let newItem = { id: uuidv4(), colid: action.payload.columnId };
      tableKey.cols = [...tableKey.cols, newItem];
      return { ...state, [action.payload.tableId]: tableToUpdate3 };
    }

    case REMOVE_COLUMN_FROM_KEY: {
      let tableToUpdate4 = _.cloneDeep(state[action.payload.tableId]);
      let tableKey = _.find(tableToUpdate4.keys, ["id", action.payload.keyId]);
      tableKey.cols = _.reject(tableKey.cols, {
        colid: action.payload.columnId
      });
      return { ...state, [action.payload.tableId]: tableToUpdate4 };
    }
    case REMOVE_EMPTY_FROM_KEY: {
      let tableToUpdate5 = _.cloneDeep(state[action.payload.tableId]);
      let tableKey = _.find(tableToUpdate5.keys, ["id", action.payload.keyId]);
      tableKey.cols = _.reject(tableKey.cols, {
        colid: action.payload.columnId
      });
      return { ...state, [action.payload.tableId]: tableToUpdate5 };
    }

    case UPDATE_INDEX_COLUMN_PROPERTY: {
      var clnActvTbl = _.cloneDeep(state[action.payload.tableId]);

      var ixToUpdate = _.find(clnActvTbl.indexes, [
        "id",
        action.payload.indexId
      ]);
      var ixColToUpdate = _.find(ixToUpdate.cols, [
        "id",
        action.payload.indexColumnId
      ]);
      ixColToUpdate[action.payload.pName] = action.payload.newValue;
      return { ...state, [action.payload.tableId]: clnActvTbl };
    }

    case UPDATE_COLUMN_PROPERTY: {
      let position = _.findIndex(state[action.payload.tableId].cols, [
        "id",
        action.payload.columnId
      ]);

      return {
        ...state,
        [action.payload.tableId]: {
          ...state[action.payload.tableId],
          cols: [
            ...state[action.payload.tableId].cols.slice(0, position),
            Object.assign({}, state[action.payload.tableId].cols[position], {
              [action.payload.pName]: action.payload.newValue //change any property of idx
            }),
            ...state[action.payload.tableId].cols.slice(position + 1)
          ]
        }
      };
    }

    case UPDATE_KEY_PROPERTY: {
      let position = _.findIndex(state[action.payload.tableId].keys, [
        "id",
        action.payload.keyId
      ]);

      return {
        ...state,
        [action.payload.tableId]: {
          ...state[action.payload.tableId],
          keys: [
            ...state[action.payload.tableId].keys.slice(0, position),
            Object.assign({}, state[action.payload.tableId].keys[position], {
              [action.payload.pName]: action.payload.newValue //change any property of idx
            }),
            ...state[action.payload.tableId].keys.slice(position + 1)
          ]
        }
      };
    }

    case UPDATE_INDEX_PROPERTY: {
      let position = _.findIndex(state[action.payload.tableId].indexes, [
        "id",
        action.payload.indexId
      ]);

      return {
        ...state,
        [action.payload.tableId]: {
          ...state[action.payload.tableId],
          indexes: [
            ...state[action.payload.tableId].indexes.slice(0, position),
            Object.assign({}, state[action.payload.tableId].indexes[position], {
              [action.payload.pName]: action.payload.newValue //change any property of idx
            }),
            ...state[action.payload.tableId].indexes.slice(position + 1)
          ]
        }
      };
    }

    case FETCH_COLUMN:
      return {
        ...state,
        [action.payload.tableId]: {
          ...state[action.payload.tableId],
          cols: [
            //...state[action.payload.tableId].cols,
            //action.payload.column
            ...state[action.payload.tableId].cols.slice(
              0,
              action.payload.position
            ),
            action.payload.column,
            ...state[action.payload.tableId].cols.slice(action.payload.position)
          ]
        }
      };
    case DELETE_COLUMN_BY_ID:
      let tableToUpdate15 = _.cloneDeep(state[action.payload.tableId]);
      tableToUpdate15.cols = _.reject(tableToUpdate15.cols, {
        id: action.payload.columnId
      });
      return { ...state, [action.payload.tableId]: tableToUpdate15 };

    case DELETE_COLUMN:
      return {
        ...state,
        [action.payload.tableId]: {
          ...state[action.payload.tableId],
          cols: [
            ...state[action.payload.tableId].cols.slice(
              0,
              action.payload.position
            ),
            ...state[action.payload.tableId].cols.slice(
              action.payload.position + 1
            )
          ]
        }
      };

    case FETCH_KEY:
      return {
        ...state,
        [action.payload.tableId]: {
          ...state[action.payload.tableId],
          keys: [
            //...state[action.payload.tableId].cols,
            //action.payload.column
            ...state[action.payload.tableId].keys.slice(
              0,
              action.payload.position
            ),
            action.payload.key,
            ...state[action.payload.tableId].keys.slice(action.payload.position)
          ]
        }
      };
    case DELETE_KEY:
      return {
        ...state,
        [action.payload.tableId]: {
          ...state[action.payload.tableId],
          keys: [
            ...state[action.payload.tableId].keys.slice(
              0,
              action.payload.position
            ),
            ...state[action.payload.tableId].keys.slice(
              action.payload.position + 1
            )
          ]
        }
      };
    case UPDATE_TABLE_PROPERTIES:
      return {
        ...action.payload.reduce(
          (r, propertyChange) => ({
            ...r,
            [propertyChange.id]: {
              ...r[propertyChange.id],
              [propertyChange.propname]: propertyChange.propvalue
            }
          }),
          state
        )
      };

    case UPDATE_TABLE_PROPERTY:
      return {
        ...state,
        [action.payload.tableId]: {
          ...state[action.payload.tableId],
          [action.payload.pName]: action.payload.newValue
        }
      };

    case FETCH_INDEX:
      return {
        ...state,
        [action.payload.tableId]: {
          ...state[action.payload.tableId],
          indexes: [
            //...state[action.payload.tableId].cols,
            //action.payload.column
            ...state[action.payload.tableId].indexes.slice(
              0,
              action.payload.position
            ),
            action.payload.index,
            ...state[action.payload.tableId].indexes.slice(
              action.payload.position
            )
          ]
        }
      };
    case DELETE_INDEX:
      return {
        ...state,
        [action.payload.tableId]: {
          ...state[action.payload.tableId],
          indexes: [
            ...state[action.payload.tableId].indexes.slice(
              0,
              action.payload.position
            ),
            ...state[action.payload.tableId].indexes.slice(
              action.payload.position + 1
            )
          ]
        }
      };
    case FETCH_TABLE:
      return { ...state, [action.payload.id]: action.payload };
    case FETCH_TABLES:
      var rawData = action.payload.tables;
      return _.mapKeys(rawData, "id");
    default:
      return state;
  }
}
