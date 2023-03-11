import {
  CLEAR_TABLES,
  DELETE_COLUMN,
  DELETE_COLUMN_BY_ID,
  DELETE_TABLE,
  FETCH_COLUMN_AND_CATALOG,
  FETCH_TABLES,
  FETCH_TABLE_AND_CATALOG,
  IMPORT_TABLES,
  REMOVE_CHILD_TABLE
} from "../actions/tables";
import { isMoon, isPerseid } from "../helpers/features/features";

import { CLEAR_MODEL } from "../actions/model";
import Helpers from "../helpers/helpers";
import JsonSchemaHelpers from "../platforms/jsonschema/helpers_jsonschema";
import { TableControlTypesJson } from "../platforms/jsonschema/class_table_jsonschema";
import _ from "lodash";

const INITIAL_STATE = { colToTable: {}, tableToCol: {} };

export default function (state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case CLEAR_TABLES:
    case CLEAR_MODEL:
      return INITIAL_STATE;

    case DELETE_TABLE:
      const deleteTableProfile = action.payload.profile;
      const id = action.payload.id;
      if (isPerseid(deleteTableProfile) || isMoon(deleteTableProfile)) {
        return {
          ...state,
          colToTable: _.mapKeys(
            _.filter(
              state.colToTable,
              (item) => item["belongsToTableId"] !== id
            ),
            "colId"
          ),
          tableToCol: _.mapKeys(
            _.filter(
              state.tableToCol,
              (item) =>
                item["childTableId"] !== id && item["parentColId"] !== id
            ),
            "childTableId"
          )
        };
      }
      return state;

    case DELETE_COLUMN:
    case DELETE_COLUMN_BY_ID:
      const deleteColumnProfile = action.payload.profile;
      if (isPerseid(deleteColumnProfile) || isMoon(deleteColumnProfile)) {
        return {
          ...state,
          colToTable: _.mapKeys(
            _.omit(state.colToTable, action.payload.columnId),
            "colId"
          ),
          tableToCol: _.mapKeys(
            _.filter(
              state.tableToCol,
              (item) => item.parentColId !== action.payload.columnId
            ),
            "childTableId"
          )
        };
      }
      return state;
    case REMOVE_CHILD_TABLE:
      const removeChildTableProfile = action.payload.profile;
      if (
        isPerseid(removeChildTableProfile) ||
        isMoon(removeChildTableProfile)
      ) {
        return {
          ...state,
          tableToCol: _.mapKeys(
            _.filter(
              state.tableToCol,
              (item) => item.childTableId !== action.payload.childTableId
            ),
            "childTableId"
          )
        };
      }
      return state;
    case FETCH_COLUMN_AND_CATALOG:
      const fetchColumnAndCatalogProfile = action.payload.profile;
      if (
        isPerseid(fetchColumnAndCatalogProfile) ||
        isMoon(fetchColumnAndCatalogProfile)
      ) {
        const parentColumnId = action.payload.parentColumn.id;
        const childTableId = action.payload.childTableId;
        const parentTableId = action.payload.parentTableId;

        const fetchColumnAndCatalogTableToCol = {
          ...state.tableToCol,
          [childTableId]: {
            childTableId: childTableId,
            parentColId: parentColumnId,
            parentTableId: parentTableId
          }
        };
        const rootObjectForColumn = Helpers.getRootTableIdForTableId(
          parentTableId,
          fetchColumnAndCatalogTableToCol
        );

        return {
          ...state,
          colToTable: {
            ...state.colToTable,
            [parentColumnId]: {
              colId: parentColumnId,
              belongsToTableId: parentTableId,
              rootTableId: rootObjectForColumn
            }
          },
          tableToCol: fetchColumnAndCatalogTableToCol
        };
      }
      return state;
    case FETCH_TABLE_AND_CATALOG:
      const fetchTableAndCatalogProfile = action.payload.profile;
      if (
        isPerseid(fetchTableAndCatalogProfile) ||
        isMoon(fetchTableAndCatalogProfile)
      ) {
        let colsToBeAdded = [];
        const fetchedTable = action.payload.table;
        const fetchTableAndCatalogTableToCol = {
          ..._.mapKeys(
            _.filter(
              state.tableToCol,
              (item) => item.parentTableId !== fetchedTable.id
            ),
            "childTableId"
          )
        };
        _.forEach(fetchedTable.cols, (col) => {
          if (
            action.payload.tables[col.datatype] &&
            (action.payload.tables[col.datatype].nodeType ===
              TableControlTypesJson.STANDARD ||
              action.payload.tables[col.datatype].nodeType === undefined)
          ) {
            fetchTableAndCatalogTableToCol[col.datatype] = {
              childTableId: col.datatype,
              parentColId: col.id,
              parentTableId: fetchedTable.id
            };
          }
        });
        if (_.size(fetchedTable.cols) > 0) {
          _.map(fetchedTable.cols, (col) => {
            let rootObject = Helpers.getRootTableIdForTableId(
              fetchedTable.id,
              fetchTableAndCatalogTableToCol
            );

            let column = {
              colId: col.id,
              belongsToTableId: fetchedTable.id,
              rootTableId: rootObject
            };
            colsToBeAdded = [...colsToBeAdded, column];
          });
        }
        let colsToAdd = _.mapKeys(colsToBeAdded, "colId");
        return {
          ...state,
          colToTable: { ...state.colToTable, ...colsToAdd },
          tableToCol: fetchTableAndCatalogTableToCol
        };
      }
      return state;

    case FETCH_TABLES:
    case IMPORT_TABLES:
      const importTablesProfile = action.payload.profile;
      if (isPerseid(importTablesProfile) || isMoon(importTablesProfile)) {
        const tables = action.payload.tables;

        const tableToCol = _.reduce(
          tables,
          (result, table) => ({
            ...result,
            ..._.keyBy(
              _.map(
                _.filter(table.cols, (col) => !!tables[col.datatype]),
                (col) => {
                  return {
                    childTableId: col.datatype,
                    parentColId: col.id,
                    parentTableId: table.id
                  };
                }
              ),
              "childTableId"
            )
          }),
          {}
        );
        let colToTable = {};
        _.forEach(tables, (table) => {
          _.forEach(
            _.filter(table.cols, (col) => !!tables[col.datatype]),
            (col) => {
              colToTable[col.id] = {
                colId: col.id,
                belongsToTableId: table.id,
                rootTableId: Helpers.getRootTableIdForTableId(
                  table.id,
                  tableToCol
                )
              };
            }
          );
        });

        return { ...state, colToTable, tableToCol };
      }
      return state;
    default:
      return state;
  }
}
