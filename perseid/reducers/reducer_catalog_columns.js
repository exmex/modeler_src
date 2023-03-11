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

import { CLEAR_MODEL } from "../actions/model";
import JsonSchemaHelpers from "../platforms/jsonschema/helpers_jsonschema";
import { TableControlTypesJson } from "../platforms/jsonschema/class_table_jsonschema";
import _ from "lodash";
import { isPerseid } from "../helpers/features/features";

const INITIAL_STATE = { colToTable: {}, tableToCol: {} };

export default function (state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case CLEAR_TABLES:
    case CLEAR_MODEL:
      return INITIAL_STATE;

    case DELETE_TABLE:
      return {
        ...state,
        colToTable: _.mapKeys(
          _.filter(
            state.colToTable,
            (item) => item["belongsToTableId"] !== action.payload
          ),
          "colId"
        ),
        tableToCol: _.mapKeys(
          _.filter(
            state.tableToCol,
            (item) =>
              item["childTableId"] !== action.payload &&
              item["parentColId"] !== action.payload
          ),
          "childTableId"
        )
      };

    case DELETE_COLUMN:
    case DELETE_COLUMN_BY_ID:
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
    case REMOVE_CHILD_TABLE:
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
    case FETCH_COLUMN_AND_CATALOG:
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
      const rootObjectForColumn = JsonSchemaHelpers.getRootTableIdForTableId(
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
    case FETCH_TABLE_AND_CATALOG:
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
          action.payload.tables[col.datatype].nodeType ===
          TableControlTypesJson.STANDARD
        )
          fetchTableAndCatalogTableToCol[col.datatype] = {
            childTableId: col.datatype,
            parentColId: col.id,
            parentTableId: fetchedTable.id
          };
      });
      if (_.size(fetchedTable.cols) > 0) {
        _.map(fetchedTable.cols, (col) => {
          let rootObject = JsonSchemaHelpers.getRootTableIdForTableId(
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
    case FETCH_TABLES:
    case IMPORT_TABLES:
      const tables = action.payload.tables;
      const profile = action.payload.profile;
      if (!isPerseid(profile)) {
        return state;
      }

      const tableToCol = _.reduce(
        tables,
        (result, table) => ({
          ...result,
          ..._.keyBy(
            _.map(table.cols, (col) => ({
              childTableId: col.datatype,
              parentColId: col.id,
              parentTableId: table.id
            })),
            "childTableId"
          )
        }),
        {}
      );
      let colToTable = {};
      _.forEach(tables, (table) => {
        _.forEach(table.cols, (col) => {
          colToTable[col.id] = {
            colId: col.id,
            belongsToTableId: table.id,
            rootTableId: JsonSchemaHelpers.getRootTableIdForTableId(
              table.id,
              tableToCol
            )
          };
        });
      });

      return { ...state, colToTable, tableToCol };
    default:
      return state;
  }
}
