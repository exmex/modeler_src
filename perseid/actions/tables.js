import {
  ClassColumnJsonSchema,
  KeyTypeNames
} from "../platforms/jsonschema/class_column_jsonschema";
import {
  ClassTableJsonSchema,
  TableControlTypesJson,
  TableObjectTypesJson
} from "../platforms/jsonschema/class_table_jsonschema";
import { DiagramAreaMode, ModelTypes, ObjectType } from "../enums/enums";
import {
  addDiagramItems,
  deleteAllDiagramItems,
  updateDiagramItemProperty
} from "./diagrams";
import {
  deleteRelation,
  deleteRelationKeyColumnPair,
  fetchRelation,
  fetchRelationKeyColumnPair
} from "./relations";
import {
  forwardFieldChanges,
  getForwardedFieldChanges
} from "./platforms/graphql/graphql";
import {
  removeFromOrder,
  resetOrderOfComposites,
  resetOrderOfTables,
  setOrder,
  updateOrderForNewObject
} from "./order";

import { ClassColumn } from "../classes/class_column";
import { ClassDiagramItem } from "../classes/class_diagram_item";
import { ClassTableMongoDb } from "../platforms/mongodb/class_table_mongodb";
import GraphQlHelpers from "../platforms/graphql/helpers_graphql";
import JsonSchemaHelpers from "../platforms/jsonschema/helpers_jsonschema";
import LogicalHelpers from "../platforms/logical/helpers_logical";
import MongoDbHelpers from "../platforms/mongodb/helpers_mongodb";
import MongooseHelpers from "../platforms/mongoose/helpers_mongoose";
import MySQLFamilyHelpers from "../platforms/mysql_family/helpers_mysql_family";
import PGHelpers from "../platforms/pg/helpers_pg";
import SQLiteHelpers from "../platforms/sqlite/helpers_sqlite";
import SequelizeHelpers from "../platforms/sequelize/helpers_sequelize";
import _ from "lodash";
import { addNotification } from "./notifications";
import { checkLimit } from "../components/license_limitation";
import { deleteLine } from "./lines";
import { deleteNote } from "./notes";
import { deleteOtherObject } from "./other_objects";
import { getCurrentHistoryTransaction } from "./undoredo";
import isElectron from "is-electron";
import { isPerseid } from "../helpers/features/features";
import moment from "moment";
import { navigateByObjectType } from "../components/url_navigation";
import { removeFromSelection } from "./selections";
import { setDiagramAreaMode } from "./ui";
import { v4 as uuidv4 } from "uuid";

export const FETCH_TABLES = "fetch_tables";
export const FETCH_TABLE = "fetch_table";
export const FETCH_TABLE_AND_CATALOG = "fetch_table_and_catalog";
export const FETCH_COLUMN_AND_CATALOG = "fetch_column_and_catalog";
export const REMOVE_CHILD_TABLE = "remove_child_table";
export const ADD_TABLE = "add_table";
export const FETCH_COLUMN = "fetch_column";
export const DELETE_COLUMN = "delete_column";
export const DELETE_COLUMN_BY_ID = "delete_column_by_id";
export const FETCH_KEY = "fetch_key";
export const DELETE_KEY = "delete_key";
export const FETCH_INDEX = "fetch_index";
export const DELETE_INDEX = "delete_index";
export const DELETE_TABLE = "delete_table";
export const CLEAR_TABLES = "clear_tables";
export const IMPORT_TABLES = "import_tables";
export const COPY_SELECTED_TABLES = "copy_selected_tables";
export const DELETE_SELECTED_TABLES = "delete_selected_tables";
export const UPDATE_TABLE_PROPERTY = "update_table_property";
export const UPDATE_COLUMN_PROPERTY = "update_column_property";
export const UPDATE_TABLE_PROPERTIES = "update_table_properties";
export const UPDATE_KEY_PROPERTY = "update_key_property";
export const UPDATE_INDEX_PROPERTY = "update_index_property";
export const ADD_COLUMN_TO_KEY = "add_column_to_pk";
export const REMOVE_COLUMN_FROM_KEY = "remove_column_from_pk";
export const ADD_COLUMN_TO_INDEX = "add_column_to_index";
export const REMOVE_COLUMN_FROM_INDEX = "remove_column_from_index";
export const REMOVE_COLUMN_FROM_INDEX_BY_COLUMN_ID =
  "remove_column_from_index_by_column_id";
export const UPDATE_INDEX_COLUMN_PROPERTY = "update_index_column_property";
export const REMOVE_EMPTY_FROM_KEY = "removeEmptyFromKey";
export const COLUMN_SELECTED = "column_selected";

function getDefaultDataType(projectType, isEmbedded) {
  switch (projectType) {
    case ModelTypes.MONGODB:
      return isEmbedded
        ? MongoDbHelpers.getMongoDBDefaultEmbeddableType()
        : MongoDbHelpers.getMongoDBDefaultType();
    case ModelTypes.MONGOOSE:
      return isEmbedded
        ? MongooseHelpers.getMongooseDefaultEmbeddableType()
        : MongooseHelpers.getMongooseDefaultType();
    case ModelTypes.PG:
      return isEmbedded
        ? PGHelpers.getPGDefaultEmbeddableType()
        : PGHelpers.getPGDefaultType();
    case ModelTypes.SQLITE:
      return isEmbedded
        ? SQLiteHelpers.getSQLiteDefaultEmbeddableType()
        : SQLiteHelpers.getSQLiteDefaultType();
    case ModelTypes.GRAPHQL:
      return GraphQlHelpers.getGraphQlDefaultType();
    case ModelTypes.MARIADB:
    case ModelTypes.MYSQL:
      return isEmbedded
        ? MySQLFamilyHelpers.getDefaultEmbeddableType()
        : MySQLFamilyHelpers.getDefaultType();
    case ModelTypes.SEQUELIZE:
      return isEmbedded
        ? SequelizeHelpers.getSequelizeDefaultEmbeddableType()
        : SequelizeHelpers.getSequelizeDefaultType();
    case ModelTypes.LOGICAL:
      return isEmbedded
        ? LogicalHelpers.getLogicalDefaultEmbeddableType()
        : LogicalHelpers.getLogicalDefaultType();
    case ModelTypes.JSONSCHEMA:
    case ModelTypes.FULLJSON:
    case ModelTypes.OPENAPI:
      return isEmbedded
        ? JsonSchemaHelpers.getJsonSchemaDefaultEmbeddableType()
        : JsonSchemaHelpers.getJsonSchemaDefaultType();
    default:
      return undefined;
  }
}

export function updateMissingDataType(datatypeId) {
  return async (dispatch, getState) => {
    const state = getState();
    for (const table of _.values(state.tables)) {
      const cols = table.cols || [];
      for (const column of cols) {
        if (column.datatype === datatypeId) {
          await dispatch(
            updateColumnProperty(
              table.id,
              column.id,
              getDefaultDataType(state.model.type, table.embeddable),
              "datatype"
            )
          );
        }
      }
    }
  };
}

export function addColumnToIndex(columnId, tableId, indexId) {
  return {
    type: ADD_COLUMN_TO_INDEX,
    payload: { columnId, tableId, indexId }
  };
}

export function removeColumnFromIndex(columnId, tableId, indexId) {
  return {
    type: REMOVE_COLUMN_FROM_INDEX,
    payload: { columnId, tableId, indexId }
  };
}

export function removeColumnFromIndexByColumnId(columnId, tableId, indexId) {
  return {
    type: REMOVE_COLUMN_FROM_INDEX_BY_COLUMN_ID,
    payload: { columnId, tableId, indexId }
  };
}

export function updateIndexColumnProperty(
  tableId,
  indexId,
  indexColumnId,
  newValue,
  pName
) {
  return async (dispatch, getState) => {
    await dispatch({
      type: UPDATE_INDEX_COLUMN_PROPERTY,
      payload: { tableId, indexId, indexColumnId, newValue, pName }
    });
  };
}

function addColumnToRelation(parent, child, r, columnId) {
  return async (dispatch, getState) => {
    var colToAdd = _.cloneDeep(_.find(parent.cols, ["id", columnId]));
    const existingCol =
      getState().model.type === ModelTypes.GRAPHQL &&
      child.cols.find(
        (col) =>
          col.name === colToAdd.name &&
          col.datatype === colToAdd.datatype &&
          col.list === colToAdd.list &&
          col.nn == colToAdd.nn
      );
    if (existingCol) {
      let colspair = {
        id: uuidv4(),
        parentcol: columnId,
        childcol: existingCol.id
      };
      await dispatch(
        fetchRelationKeyColumnPair(colspair, r.id, _.size(r.cols))
      );
    } else {
      if (colToAdd) {
        colToAdd.id = uuidv4();
        if (getState().model.parentTableInFkCols === true) {
          if (getState().model.caseConvention === "under") {
            colToAdd.name = parent.name + "_" + colToAdd.name;
          } else {
            colToAdd.name = parent.name + _.upperFirst(colToAdd.name);
          }
        }
        colToAdd.pk = false;
        colToAdd.fk = true;
        let colspair = {
          id: uuidv4(),
          parentcol: columnId,
          childcol: colToAdd.id
        };
        await dispatch(
          fetchRelationKeyColumnPair(colspair, r.id, _.size(r.cols))
        );
        await dispatch(fetchColumn(colToAdd, child.id, _.size(child.cols)));
        getCurrentHistoryTransaction().addResizeRequest({
          domToModel: true,
          operation: "addColumnToChild",
          autoExpand: true,
          objects: [child.id]
        });
      }
    }
  };
}

export function getAutoGeneratedDependentRelations(
  settings,
  tables,
  depedentRelations
) {
  return _.reduce(
    depedentRelations,
    (result, depedentRelation) => {
      const autoGeneratedRelations = getAutoGeneratedRelations(
        settings,
        { [depedentRelation.id]: depedentRelation },
        {
          [depedentRelation.child]: tables[depedentRelation.child]
        }
      );
      return {
        ...result,
        ..._.reduce(
          autoGeneratedRelations,
          (autoGeneratedDependentRelations, autoGeneratedRelation) => {
            return {
              ...autoGeneratedDependentRelations,
              [autoGeneratedRelation.relation.id]: autoGeneratedRelation
            };
          },
          {}
        )
      };
    },
    []
  );
}

export function getDependentRelations(relations, parentTable, key) {
  return _.filter(
    _.map(parentTable.relations, (relationId) => relations[relationId]),
    (relation) =>
      relation.parent === parentTable.id && key.id === relation.parent_key
  );
}

export function getAutoGeneratedNamesForKey({
  settings,
  tables,
  table,
  key,
  relations
}) {
  const autoGeneratedKeys = getAutoGeneratedKeys(settings, tables, table);
  const dependentRelations = getDependentRelations(relations, table, key);
  const autoGeneratedDependentRelations = getAutoGeneratedDependentRelations(
    settings,
    tables,
    dependentRelations
  );
  return {
    autoGeneratedKeys,
    dependentRelations,
    autoGeneratedDependentRelations,
    table,
    key
  };
}

export function updateAutoGeneratedNamesForKey({
  autoGeneratedKeys,
  autoGeneratedDependentRelations,
  table
}) {
  return async (dispatch, getState) => {
    if (autoGeneratedKeys.length > 0) {
      await dispatch(updateKeyIndexNames(table.id, autoGeneratedKeys, []));
    }

    const autoGeneratedDependentRelationsValues = _.values(
      autoGeneratedDependentRelations
    );

    if (autoGeneratedDependentRelationsValues.length > 0) {
      for (const autoGeneratedDependentRelation of autoGeneratedDependentRelationsValues) {
        const newRelation =
          getState().relations[autoGeneratedDependentRelation.relation.id];
        const modifiedDependentRelation = {
          ...newRelation,
          cols: newRelation.cols
        };
        modifiedDependentRelation.name = PGHelpers.makeRelationName(
          modifiedDependentRelation,
          {
            [newRelation.child]: getState().tables[newRelation.child]
          },
          getState().relations
        );

        await dispatch(fetchRelation(modifiedDependentRelation));
      }
    }
  };
}

export function addColumnToKey(activeTableId, columnId, tableId, keyId) {
  return async (dispatch, getState) => {
    let k = _.find(getState().tables[tableId].keys, ["id", keyId]);
    if (columnId === "0") {
      if (getState().tables[tableId].relations) {
        for (let rid of getState().tables[tableId].relations) {
          let r = getState().relations[rid];
          if (r.parent_key === keyId && r.parent === activeTableId) {
            let colspair = {
              id: uuidv4(),
              parentcol: columnId,
              childcol: columnId
            };
            await dispatch(
              fetchRelationKeyColumnPair(colspair, r.id, _.size(r.cols))
            );
          }
        }
      }
    } else {
      if (k.isPk === true) {
        await dispatch(updateColumnProperty(tableId, columnId, true, "pk"));
      }

      if (getState().tables[tableId].relations) {
        for (let rid of getState().tables[tableId].relations) {
          let r = getState().relations[rid];
          if (r.parent_key === keyId && r.parent === activeTableId) {
            //if (r.parent_key === keyId) {
            var parent = getState().tables[r.parent];
            var child = getState().tables[r.child];
            //add columns
            await dispatch(addColumnToRelation(parent, child, r, columnId));
          }
        }
      }
    }

    await dispatch({
      type: ADD_COLUMN_TO_KEY,
      payload: { columnId, tableId, keyId }
    });
  };
}

export function removeEmptyFromKey(columnId, tableId, keyId) {
  return (dispatch, getState) => {
    var tableKey = _.find(getState().tables[tableId].keys, ["id", keyId]);
    var keyColToDelete = _.find(tableKey.cols, ["colid", columnId]);
    if (keyColToDelete) {
      dispatch({
        type: REMOVE_EMPTY_FROM_KEY,
        payload: { columnId, tableId, keyId }
      });
    }
  };
}

function isInTable(cols, columnId) {
  return !!_.find(cols, ["id", columnId]);
}

export function removeColumnFromKey(historyContext, columnId, tableId, keyId) {
  return async (dispatch, getState) => {
    const state = getState();

    var tableKey = _.find(state.tables[tableId].keys, ["id", keyId]);
    if (
      tableKey.isPk === true &&
      columnId !== "0" &&
      isInTable(state.tables[tableId].cols, columnId) === true
    ) {
      await dispatch(updateColumnProperty(tableId, columnId, false, "pk"));
    }

    var keyColsToDelete = _.filter(tableKey.cols, { colid: columnId });

    for (const keyColToDelete of keyColsToDelete) {
      // remove from cols from child tables, remove from table key, remove pair from relation
      for (var rid of state.tables[tableId].relations) {
        var r = state.relations[rid];
        if (r.parent_key === keyId && r.parent === state.tables[tableId].id) {
          let childTable = state.tables[r.child];

          var relationChildColId = _.find(r.cols, [
            "parentcol",
            keyColToDelete.colid
          ]);

          var cnt = 0;
          for (var relItem of childTable.relations) {
            var rObj = state.relations[relItem];
            if (relationChildColId) {
              cnt += _.size(
                _.filter(rObj.cols, ["childcol", relationChildColId.childcol])
              );
              //also do not delete columns that are in children used as parent column in another relations
              cnt += _.size(
                _.filter(rObj.cols, ["parentcol", relationChildColId.childcol])
              );
            }
          }
          if (cnt === 1) {
            await dispatch(
              deleteColumnFromAllObjects(
                historyContext,
                childTable.id,
                relationChildColId.childcol
              )
            );
          }
          await dispatch(
            deleteRelationKeyColumnPair(
              r.id,
              _.findIndex(r.cols, ["parentcol", keyColToDelete.colid])
            )
          );
          await dispatch(
            updateChildColumnFkProperty(
              childTable.id,
              relationChildColId.childcol
            )
          );
        }
      }

      await dispatch({
        type: REMOVE_COLUMN_FROM_KEY,
        payload: { columnId, tableId, keyId }
      });

      getCurrentHistoryTransaction().addResizeRequest({
        domToModel: true,
        operation: "removeColumnFromKey"
      });
    }
  };
}

export function updateChildColumnFkProperty(childTableId, childColumnId) {
  return async (dispatch, getState) => {
    const state = getState();
    const childTable = state.tables[childTableId];
    const relations = state.relations;
    const childTableRelations = _.map(
      childTable.relations,
      (relationId) => relations[relationId]
    );
    const relationWithChildColumnId = _.filter(
      childTableRelations,
      (relation) =>
        !!_.find(relation.cols, (relcol) => relcol.childcol === childColumnId)
    );
    const childColumn = _.find(childTable.cols, ["id", childColumnId]);
    if (childColumn) {
      if (relationWithChildColumnId.length > 0) {
        if (!childColumn.fk) {
          await dispatch(
            updateColumnProperty(childTable.id, childColumnId, true, "fk")
          );
        }
      } else {
        if (childColumn.fk) {
          await dispatch(
            updateColumnProperty(childTable.id, childColumnId, false, "fk")
          );
        }
      }
    }
  };
}

export function deleteSelectedObjects(historyContext) {
  return async (dispatch, getState) => {
    if (_.size(getState().selections) > 0) {
      const selections = _.map(getState().selections);
      for (const selection of selections) {
        if (selection.objectType === "table") {
          await dispatch(deleteTable(historyContext, selection.objectId));
          await dispatch(removeFromSelection(selection.objectId));
        } else if (selection.objectType === "note") {
          await dispatch(deleteNote(selection.objectId));
          await dispatch(removeFromSelection(selection.objectId));
        } else if (selection.objectType === "other_object") {
          await dispatch(deleteOtherObject(selection.objectId));
          await dispatch(removeFromSelection(selection.objectId));
        }
      }
    }
    getCurrentHistoryTransaction().addResizeRequest({
      domToModel: false,
      operation: "deleteSelectedObjects"
    });
  };
}

export function importTables(tables, profile) {
  return {
    type: IMPORT_TABLES,
    payload: { tables, profile }
  };
}

export function clearTables() {
  return {
    type: CLEAR_TABLES
  };
}

function deleteRels(historyContext, relationIds) {
  return async (dispatch) => {
    for (const relationId of relationIds) {
      await dispatch(deleteRelation(historyContext, relationId));
    }
  };
}

function deleteLines(lines) {
  return async (dispatch) => {
    if (lines) {
      for (var line of lines) {
        await dispatch(deleteLine(line));
      }
    }
  };
}

export function deleteTable(historyContext, id) {
  return async (dispatch, getState) => {
    await dispatch(removeFromOrder(id));
    await dispatch(deleteRels(historyContext, getState().tables[id].relations));
    await dispatch(deleteLines(getState().tables[id].lines));
    await dispatch(deleteAllDiagramItems(id));
    await dispatch(updateMissingDataType(id));
    await dispatch({
      type: DELETE_TABLE,
      payload: id
    });

    getCurrentHistoryTransaction().addResizeRequest({
      domToModel: true,
      operation: "deleteTable"
    });
  };
}

export function addTable(table) {
  return async (dispatch, getState) => {
    await dispatch({
      type: ADD_TABLE,
      payload: table
    });
    await dispatch(updateOrderForNewObject(getState().model.type));
  };
}

function isPgInheritsChange(newValue, table, model) {
  const isPg = model.model.type === ModelTypes.PG;
  const isInheritsChanged = newValue.inherits !== table?.pg?.inherits;
  if (isPg && isInheritsChanged) {
    const newModel = {
      ...model,
      tables: {
        ...model.tables,
        [table.id]: { ...model.tables[table.id], pg: newValue }
      }
    };
    const newOrder = resetOrderOfTables(newModel);
    return !_.isEqual(model.order, newOrder);
  }
  return false;
}

function updateTableNamePg(table, newName, pName) {
  return async (dispatch, getState) => {
    const state = getState();
    const settings = {
      nameAutoGeneration: state.model.nameAutoGeneration,
      type: state.model.type
    };
    const autoGeneratedKeys = getAutoGeneratedKeys(
      settings,
      state.tables,
      table
    );
    const autoGeneratedIndexes = getAutoGeneratedIndexes(
      settings,
      state.tables,
      table
    );

    const autoGeneratedRelations = getAutoGeneratedRelations(
      settings,
      state.relations,
      { [table.id]: table }
    );

    if (
      autoGeneratedKeys.length > 0 ||
      autoGeneratedIndexes.length > 0 ||
      autoGeneratedRelations.length > 0
    ) {
      if (autoGeneratedKeys.length > 0 || autoGeneratedIndexes.length > 0) {
        await dispatch(
          updateTableNameKeyIndexNames(
            table,
            newName,
            autoGeneratedKeys,
            autoGeneratedIndexes
          )
        );
      } else {
        await dispatch({
          type: UPDATE_TABLE_PROPERTY,
          payload: { tableId: table.id, newValue: newName, pName }
        });
      }
      if (autoGeneratedRelations.length > 0) {
        await dispatch(updateRelationNames(autoGeneratedRelations));
      }
    } else {
      await dispatch({
        type: UPDATE_TABLE_PROPERTY,
        payload: { tableId: table.id, newValue: newName, pName }
      });
    }
  };
}

export function updateRelationNames(autoGeneratedRelations) {
  return async (dispatch, getState) => {
    const tables = getState().tables;
    const relations = getState().relations;
    for (const autoGeneratedRelation of autoGeneratedRelations) {
      const newRelation = {
        ...relations[autoGeneratedRelation.relation.id],
        name: PGHelpers.makeRelationName(
          relations[autoGeneratedRelation.relation.id],
          tables,
          relations
        )
      };
      await dispatch(fetchRelation(newRelation));
    }
  };
}

function updateTableNameKeyIndexNames(
  table,
  newName,
  autoGeneratedKeys,
  autoGeneratedIndexes
) {
  return async (dispatch, getState) => {
    const tableWithModifiedName = {
      ...table,
      name: newName
    };
    const modifiedTable = {
      ...tableWithModifiedName,
      keys: autoGenerateKeys(
        tableWithModifiedName,
        autoGeneratedKeys,
        getState().tables
      ),
      indexes: autoGenerateIndexes(
        tableWithModifiedName,
        autoGeneratedIndexes,
        getState().tables
      )
    };
    await dispatch(fetchTable(modifiedTable));
  };
}

export function updateTableProperty(tableId, newValue, pName) {
  return async (dispatch, getState) => {
    const model = getState();
    const table = model.tables[tableId];
    const pgInheritsChange = isPgInheritsChange(newValue, table, model);
    const possibleWidthChange =
      pName === "name" ||
      pName === "estimatedSize" ||
      pName === "database" ||
      pName === "schema" ||
      pName === "specification" ||
      pName === "desc" ||
      (pName === "pg" && newValue.schema !== undefined);

    if (model.model.type === ModelTypes.PG && pName === "name") {
      await dispatch(updateTableNamePg(table, newValue, pName));
    } else {
      await dispatch({
        type: UPDATE_TABLE_PROPERTY,
        payload: { tableId, newValue, pName }
      });
    }

    const isAutoSized =
      getState().diagrams[getState().model.activeDiagram]?.diagramItems[tableId]
        ?.resized === false;
    if (pName === "desc" && isAutoSized === true) {
      getCurrentHistoryTransaction().addResizeRequest({
        id: getCurrentHistoryTransaction().id,
        domToModel: true,
        operation: "updateTableProperty",
        objects: [tableId]
      });
    }

    if (pgInheritsChange) {
      const newOrder = resetOrderOfTables(getState());
      await dispatch(setOrder(newOrder));
    }

    if (possibleWidthChange) {
      getCurrentHistoryTransaction().addResizeRequest({
        domToModel: true,
        operation: "updateTableProperty"
      });
    }
  };
}

export function updateIndexProperty(tableId, indexId, newValue, pName) {
  const possibleWidthChange = pName === "name";
  return async (dispatch) => {
    await dispatch({
      type: UPDATE_INDEX_PROPERTY,
      payload: { tableId, indexId, newValue, pName }
    });

    if (possibleWidthChange) {
      getCurrentHistoryTransaction().addResizeRequest({
        domToModel: true,
        operation: "updateTableProperty"
      });
    }
  };
}

export function updateKeyProperty(tableId, keyId, newValue, pName) {
  return async (dispatch) => {
    await dispatch({
      type: UPDATE_KEY_PROPERTY,
      payload: { tableId, keyId, newValue, pName }
    });
  };
}

function updateColumnKeyIndexNames(
  table,
  column,
  newName,
  autoGeneratedKeys,
  autoGeneratedIndexes
) {
  return async (dispatch, getState) => {
    const modifiedTable = Object.assign({}, table);
    modifiedTable.cols[
      _.findIndex(table.cols, (col) => col.id === column.id)
    ].name = newName;
    modifiedTable.keys = autoGenerateKeys(
      modifiedTable,
      autoGeneratedKeys,
      getState().tables
    );
    modifiedTable.indexes = autoGenerateIndexes(
      modifiedTable,
      autoGeneratedIndexes,
      getState().tables
    );
    await dispatch(fetchTable(modifiedTable));
  };
}

function updateColumnNamePg(table, column, newValue, pName) {
  return async (dispatch, getState) => {
    const state = getState();
    const settings = {
      type: state.model.type,
      nameAutoGeneration: state.model.nameAutoGeneration
    };
    const autoGeneratedKeys = getAutoGeneratedKeys(
      settings,
      state.tables,
      table,
      column
    );
    const autoGeneratedIndexes = getAutoGeneratedIndexes(
      settings,
      state.tables,
      table,
      column
    );
    const autoGeneratedRelations = getAutoGeneratedRelations(
      settings,
      state.relations,
      { [table.id]: table }
    );

    if (
      autoGeneratedKeys.length > 0 ||
      autoGeneratedIndexes.length > 0 ||
      autoGeneratedRelations.length > 0
    ) {
      if (autoGeneratedKeys.length > 0 || autoGeneratedIndexes.length > 0) {
        await dispatch(
          updateColumnKeyIndexNames(
            table,
            column,
            newValue,
            autoGeneratedKeys,
            autoGeneratedIndexes
          )
        );
      } else {
        await dispatch({
          type: UPDATE_COLUMN_PROPERTY,
          payload: { tableId: table.id, columnId: column.id, newValue, pName }
        });
      }
      if (autoGeneratedRelations.length > 0) {
        await dispatch(updateRelationNames(autoGeneratedRelations));
      }
    } else {
      await dispatch({
        type: UPDATE_COLUMN_PROPERTY,
        payload: { tableId: table.id, columnId: column.id, newValue, pName }
      });
    }
  };
}

export function updateColumnProperty(tableId, columnId, newValue, pName) {
  return async (dispatch, getState) => {
    const model = getState();
    const oldOrder = getState().order;
    const pgCompositeDependenciesChange =
      model.model.type === ModelTypes.PG &&
      pName === "datatype" &&
      isPgCompositeDependenciesChange(model, newValue);

    const grapqlForwardedFieldChanges = getForwardedFieldChanges(
      pName,
      model,
      tableId,
      columnId
    );

    const possibleWidthChange =
      pName === "datatype" ||
      pName === "name" ||
      pName === "data" ||
      pName === "param" ||
      pName === "nn" ||
      pName === "list" ||
      pName === "isArrayItemNn" ||
      pName === "estimatedSize" ||
      pName === "ref" ||
      pName === "comment" ||
      pName === "specification";

    if (model.model.type === ModelTypes.PG && pName === "name") {
      await dispatch(
        updateColumnNamePg(
          model.tables[tableId],
          _.find(model.tables[tableId].cols, (col) => col.id === columnId),
          newValue,
          pName
        )
      );
    } else {
      await dispatch({
        type: UPDATE_COLUMN_PROPERTY,
        payload: { tableId, columnId, newValue, pName }
      });
    }

    if (pgCompositeDependenciesChange) {
      await dispatch(updatePgCompositeOrder(oldOrder));
    }

    await dispatch(
      forwardFieldChanges(grapqlForwardedFieldChanges, tableId, pName, newValue)
    );

    if (possibleWidthChange) {
      getCurrentHistoryTransaction().addResizeRequest({
        id: getCurrentHistoryTransaction().id,
        domToModel: true,
        operation: "updateColumnProperty"
      });
    }
  };
}

function isPgCompositeDependenciesChange(model, datatype) {
  const refType = model.tables[datatype];
  const isCompositeParent = refType?.objectType === "composite";
  const isCompositeChild = refType?.objectType === "composite";
  return isCompositeParent && isCompositeChild;
}

function updatePgCompositeOrder(oldOrder) {
  return async (dispatch, getState) => {
    const newOrder = resetOrderOfComposites(getState());
    const dependenciesOrderChanged = !_.isEqual(oldOrder, newOrder);
    if (dependenciesOrderChanged) {
      await dispatch(setOrder(newOrder));
    }
  };
}

export function fetchColumn(column, tableId, position) {
  return async (dispatch, getState) => {
    const oldOrder = getState().order;
    await dispatch({
      type: FETCH_COLUMN,
      payload: { column, tableId, position }
    });
    if (isPgCompositeDependenciesChange(getState(), column.datatype)) {
      await dispatch(updatePgCompositeOrder(oldOrder));
    }
  };
}

export function fetchColumnAndCatalog({
  childTableId,
  parentColumn,
  parentTableId
}) {
  return async (dispatch, getState) => {
    if (isPerseid(getState().profile)) {
      await dispatch({
        type: FETCH_COLUMN_AND_CATALOG,
        payload: { childTableId, parentColumn, parentTableId }
      });
    }
  };
}

export function removeChildTable({ childTableId }) {
  return async (dispatch) => {
    await dispatch({
      type: REMOVE_CHILD_TABLE,
      payload: { childTableId }
    });
  };
}

export function deleteColumnById(tableId, columnId) {
  return async (dispatch) => {
    await dispatch({
      type: DELETE_COLUMN_BY_ID,
      payload: { tableId, columnId }
    });
  };
}

export function deleteColumn(tableId, position, columnId) {
  return async (dispatch) => {
    await dispatch({
      type: DELETE_COLUMN,
      payload: { tableId, position, columnId }
    });
  };
}

export function fetchTable(table) {
  return async (dispatch) => {
    await dispatch({
      type: FETCH_TABLE,
      payload: table
    });

    await dispatch(fetchTableAndCatalog(table));
  };
}

export function fetchTableAndCatalog(table) {
  return async (dispatch, getState) => {
    if (isPerseid(getState().profile)) {
      await dispatch({
        type: FETCH_TABLE_AND_CATALOG,
        payload: { table, tables: getState().tables }
      });
    }
  };
}

export function fetchKey(key, tableId, position) {
  return {
    type: FETCH_KEY,
    payload: { key, tableId, position }
  };
}

export function deleteKey(tableId, position) {
  return {
    type: DELETE_KEY,
    payload: { tableId, position }
  };
}

export function fetchIndex(index, tableId, position) {
  return async (dispatch) => {
    await dispatch({
      type: FETCH_INDEX,
      payload: { index, tableId, position }
    });

    getCurrentHistoryTransaction().addResizeRequest({
      operation: "updateTableProperty",
      domToModel: true
    });
  };
}

export function deleteIndex(tableId, position) {
  return async (dispatch) => {
    await dispatch({
      type: DELETE_INDEX,
      payload: { tableId, position }
    });

    getCurrentHistoryTransaction().addResizeRequest({
      operation: "updateTableProperty",
      domToModel: true
    });
  };
}

export function handleColumnInKeyChange(
  historyContext,
  tableId,
  key_id,
  keycol_id,
  value
) {
  return async (dispatch, getState) => {
    var keyToUpdate = _.find(getState().tables[tableId].keys, ["id", key_id]);
    var k = _.find(keyToUpdate.cols, ["id", keycol_id]);

    const autoGeneratedNames = getAutoGeneratedNamesForKey({
      settings: {
        type: getState().model.type,
        nameAutoGeneration: getState().model.nameAutoGeneration
      },
      tables: getState().tables,
      table: getState().tables[tableId],
      key: keyToUpdate,
      relations: getState().relations
    });

    await dispatch(
      removeColumnFromKey(historyContext, k.colid, tableId, key_id)
    );
    await dispatch(addColumnToKey(tableId, value, tableId, key_id));
    getCurrentHistoryTransaction().addResizeRequest({
      operation: "addColumnToKey",
      domToModel: true
    });

    await dispatch(updateAutoGeneratedNamesForKey(autoGeneratedNames));
  };
}

export function onAddClick() {
  return async (dispatch, getState) => {
    const state = getState();
    await dispatch(setDiagramAreaMode(DiagramAreaMode.ADD_TABLE));
    if (isElectron) {
      if (checkLimit(state.profile, state.tables, true) === true) {
        await dispatch(
          addNotification({
            id: uuidv4(),
            datepast: moment().startOf("minute").fromNow(),
            datesort: moment().unix(),
            date: moment().format("hh:mm:ss |  DD MMMM YYYY"),
            message: state.localization.TEXTS.FREEWARE_TABLES,
            model: state.model.name,
            type: "info",
            autohide: true
          })
        );
      }
    }
  };
}

export function onAddCompositeClick() {
  return async (dispatch, getState) => {
    const state = getState();
    await dispatch(setDiagramAreaMode(DiagramAreaMode.ADD_COMPOSITE));
    if (isElectron) {
      if (checkLimit(state.profile, state.tables, true) === true) {
        await dispatch(
          addNotification({
            id: uuidv4(),
            datepast: moment().startOf("minute").fromNow(),
            datesort: moment().unix(),
            date: moment().format("hh:mm:ss |  DD MMMM YYYY"),
            message: state.localization.TEXTS.FREEWARE_TABLES,
            model: state.model.name,
            type: "info",
            autohide: true
          })
        );
      }
    }
  };
}

export function onAddEmbeddableClick() {
  return async (dispatch, getState) => {
    await dispatch(setDiagramAreaMode(DiagramAreaMode.ADD_DOCUMENT));
    const state = getState();
    if (isElectron) {
      if (checkLimit(state.profile, state.tables, true) === true) {
        await dispatch(
          addNotification({
            id: uuidv4(),
            datepast: moment().startOf("minute").fromNow(),
            datesort: moment().unix(),
            date: moment().format("hh:mm:ss |  DD MMMM YYYY"),
            message: state.localization.TEXTS.FREEWARE_TABLES,
            model: state.model.name,
            type: "info",
            autohide: true
          })
        );
      }
    }
  };
}

export function onAddInterfaceClick() {
  return async (dispatch, getState) => {
    const state = getState();
    await dispatch(setDiagramAreaMode(DiagramAreaMode.ADD_INTERFACE));
    if (isElectron) {
      if (checkLimit(state.profile, state.tables, true) === true) {
        await dispatch(
          addNotification({
            id: uuidv4(),
            datepast: moment().startOf("minute").fromNow(),
            datesort: moment().unix(),
            date: moment().format("hh:mm:ss |  DD MMMM YYYY"),
            message: state.localization.TEXTS.FREEWARE_TABLES,
            model: state.model.name,
            type: "info",
            autohide: true
          })
        );
      }
    }
  };
}

export function onAddUnionClick() {
  return async (dispatch, getState) => {
    const state = getState();
    await dispatch(setDiagramAreaMode(DiagramAreaMode.ADD_UNION));
    if (isElectron) {
      if (checkLimit(state.profile, state.tables, true) === true) {
        await dispatch(
          addNotification({
            id: uuidv4(),
            datepast: moment().startOf("minute").fromNow(),
            datesort: moment().unix(),
            date: moment().format("hh:mm:ss |  DD MMMM YYYY"),
            message: state.localization.TEXTS.FREEWARE_TABLES,
            model: state.model.name,
            type: "info",
            autohide: true
          })
        );
      }
    }
  };
}

export function onAddInputClick() {
  return async (dispatch, getState) => {
    const state = getState();
    await dispatch(setDiagramAreaMode(DiagramAreaMode.ADD_INPUT));
    if (isElectron) {
      if (checkLimit(state.profile, state.tables, true) === true) {
        await dispatch(
          addNotification({
            id: uuidv4(),
            datepast: moment().startOf("minute").fromNow(),
            datesort: moment().unix(),
            date: moment().format("hh:mm:ss |  DD MMMM YYYY"),
            message: state.localization.TEXTS.FREEWARE_TABLES,
            model: state.model.name,
            type: "info",
            autohide: true
          })
        );
      }
    }
  };
}

export function setObjectTypeToRootJsonSchema(tableId, newObjectType) {
  return async (dispatch, getState) => {
    await dispatch(updateTableProperty(tableId, newObjectType, "objectType"));
  };
}

export function setDataTypeJsonSchema(
  historyContext,
  colId,
  prevColDataTypeId,
  tableId,
  newDataTypeName
) {
  const basicDataTypes = JsonSchemaHelpers.getJsonSchemaBasicDataTypes();

  return async (dispatch, getState) => {
    if (
      _.includes(basicDataTypes, getState().tables[prevColDataTypeId]?.name) &&
      _.includes(basicDataTypes, newDataTypeName)
    ) {
      await dispatch(setDataTypeJsonSchemaSimple(colId, newDataTypeName));
    } else {
      await dispatch(
        setDataTypeJsonSchemaComplex(
          historyContext,
          colId,
          tableId,
          newDataTypeName
        )
      );
    }
  };
}

export function setDataTypeJsonSchemaSimple(colId, newDataTypeName) {
  return async (dispatch, getState) => {
    const internalDataTypeTable =
      JsonSchemaHelpers.getDatatypeTableByDatatypeColId(
        getState().tables,
        getState().catalogColumns.colToTable,
        colId
      );
    if (
      internalDataTypeTable &&
      newDataTypeName !== internalDataTypeTable.name
    ) {
      await dispatch(
        updateTableProperty(
          internalDataTypeTable.id,
          newDataTypeName,
          "objectType"
        )
      );
      await dispatch(
        updateTableProperty(internalDataTypeTable.id, newDataTypeName, "name")
      );
    }
  };
}

export function setDataTypeJsonSchemaComplex(
  historyContext,
  colId,
  tableId,
  newDataTypeName
) {
  return async (dispatch, getState) => {
    var newColDataType = newDataTypeName;

    const tableToDelete = JsonSchemaHelpers.getDatatypeTableByDatatypeColId(
      getState().tables,
      getState().catalogColumns.colToTable,
      colId
    );

    for (const obj of JsonSchemaHelpers.getJsonSchemaParentObjectTypes()) {
      if (obj === newDataTypeName) {
        newColDataType = uuidv4();
        let newInternalDataTypeTable = new ClassTableJsonSchema(
          newColDataType,
          obj,
          [],
          null,
          true,
          obj,
          TableControlTypesJson.STANDARD,
          ""
        );
        newInternalDataTypeTable.visible = false;
        await dispatch(fetchTable(newInternalDataTypeTable));
        const mainDiagram = _.find(getState().diagrams, ["main", true]);
        const cntVisibleItems = _.size(
          _.filter(getState().tables, ["visible", true])
        );
        const positionX = cntVisibleItems * 200;
        const di = new ClassDiagramItem(newColDataType, positionX, 40, 60, 160);
        di.background = "#8bc34a";

        await dispatch(addDiagramItems(mainDiagram.id, [di]));
      }
    }

    await dispatch(
      updateColumnProperty(tableId, colId, newColDataType, "datatype")
    );

    if (
      tableToDelete &&
      newDataTypeName !== tableToDelete.name &&
      !JsonSchemaHelpers.isDefOrRef(tableToDelete)
    ) {
      await dispatch(deleteTable(historyContext, tableToDelete.id));
    }
    await dispatch(fetchTableAndCatalog(getState().tables[tableId]));
  };
}

export function addJsonSchemaGlobalObject(objectType) {
  return async (dispatch, getState) => {
    var newSchema = new ClassTableJsonSchema(
      uuidv4(),
      objectType === "ref" ? "external ref" : "subschema",
      [],
      [],
      true,
      objectType,
      objectType === "ref"
        ? TableControlTypesJson.EXTERNAL_REF
        : TableControlTypesJson.SUBSCHEMA,
      ""
    );
    dispatch(fetchTable(newSchema));
    const mainDiagram = _.find(getState().diagrams, ["main", true]);
    const cntVisibleItems = _.size(
      _.filter(getState().tables, ["visible", true])
    );
    const positionX = cntVisibleItems * 200;

    const di = new ClassDiagramItem(newSchema.id, positionX, 40, 60, 180);
    di.background = "#8bc34a";
    await dispatch(addDiagramItems(mainDiagram.id, [di]));
    getCurrentHistoryTransaction().addResizeRequest({
      domToModel: false,
      operation: "addJsonSchemaGlobalObject"
    });
  };
}

export function getKeyTypeByColumnType(columnType) {
  switch (columnType) {
    case TableObjectTypesJson.ARRAY:
    case KeyTypeNames.PREFIX_ITEMS.nameKey:
      return TableObjectTypesJson.KEYARRAY;
    case TableObjectTypesJson.OBJECT:
    case KeyTypeNames.PROPERTIES.nameKey:
    case KeyTypeNames.PATTERN_PROPERTIES.nameKey:
    case KeyTypeNames.DEPENDENT_SCHEMAS.nameKey:
    case KeyTypeNames.ITEMS.nameKey:
    default:
      return TableObjectTypesJson.KEYOBJECT;
  }
}

export function addToRootJsonSchema(
  columnType,
  tableIdFromUrl,
  newPropertyName
) {
  return async (dispatch, getState) => {
    const finalTableId = uuidv4();
    const finalColId = uuidv4();
    const finalTable = new ClassTableJsonSchema(
      finalTableId,
      columnType, // "any | boolean | string etc.",
      [],
      null,
      true,
      columnType,
      TableControlTypesJson.STANDARD,
      ""
    );

    finalTable.visible = false;

    await dispatch(fetchTable(finalTable));
    const mainDiagram = _.find(getState().diagrams, ["main", true]);
    const cntVisibleItems = _.size(
      _.filter(getState().tables, ["visible", true])
    );
    const positionX = cntVisibleItems * 200;

    const di = new ClassDiagramItem(finalTable.id, positionX, 40, 60, 160);

    await dispatch(addDiagramItems(mainDiagram.id, [di]));

    const finalCol = new ClassColumnJsonSchema(
      finalColId,
      newPropertyName,
      finalTableId,
      false,
      false,
      "",
      ""
    );

    await dispatch(
      fetchColumn(
        finalCol,
        tableIdFromUrl,
        _.size(getState().tables[tableIdFromUrl].cols)
      )
    );

    await dispatch(
      fetchColumnAndCatalog({
        childTableId: finalTableId,
        parentColumn: finalCol,
        parentTableId: tableIdFromUrl
      })
    );
  };
}

function getIntermediaryTable(
  objectTypeName,
  columnId,
  tableIdFromUrl,
  tables
) {
  var intermediaryTable = undefined;
  if (
    JsonSchemaHelpers.isReserverdCaption(objectTypeName) ||
    columnId === undefined
  ) {
    intermediaryTable = _.find(tables[tableIdFromUrl]?.cols, [
      "name",
      objectTypeName
    ]);
  } else {
    intermediaryTable = _.find(tables[tableIdFromUrl]?.cols, ["id", columnId]);
  }
  return intermediaryTable;
}

export function addToJsonSchema(
  columnType,
  objectTypeName,
  tableIdFromUrl,
  intermediaryTableType,
  columnId,
  newPropertyName,
  isUnique
) {
  return async (dispatch, getState) => {
    const finalTableId = uuidv4();
    const finalColId = uuidv4();
    const intermediaryTableId = uuidv4();

    const finalTable = new ClassTableJsonSchema(
      finalTableId,
      columnType, // "any | boolean | string etc.",
      [],
      null,
      true,
      columnType,
      TableControlTypesJson.STANDARD,
      ""
    );

    finalTable.visible = false;

    await dispatch(fetchTable(finalTable));
    const mainDiagram = _.find(getState().diagrams, ["main", true]);
    const cntVisibleItems = _.size(
      _.filter(getState().tables, ["visible", true])
    );
    const positionX = cntVisibleItems * 200;
    const di = new ClassDiagramItem(finalTable.id, positionX, 40, 60, 160);

    await dispatch(addDiagramItems(mainDiagram.id, [di]));

    const finalCol = new ClassColumnJsonSchema(
      finalColId,
      newPropertyName + (isUnique ? "" : "0"),
      finalTableId,
      false,
      false,
      "",
      ""
    );

    const intermediaryTable = getIntermediaryTable(
      objectTypeName,
      columnId,
      tableIdFromUrl,
      getState().tables
    );

    if (!intermediaryTable) {
      await dispatch(
        createIntermediaryKeyTable(
          tableIdFromUrl,
          objectTypeName,
          intermediaryTableId,
          finalCol,
          intermediaryTableType
        )
      );
      await dispatch(
        fetchColumnAndCatalog({
          childTableId: finalTableId,
          parentColumn: finalCol,
          parentTableId: intermediaryTableId
        })
      );
    } else {
      await dispatch(
        addColToExistingIntermediaryKeyTable(
          finalCol,
          intermediaryTable,
          newPropertyName,
          isUnique
        )
      );
      await dispatch(
        fetchColumnAndCatalog({
          childTableId: finalTableId,
          parentColumn: finalCol,
          parentTableId: intermediaryTable.datatype
        })
      );
    }
  };
}

export function addDatatypeColTable(table, newPropertyName, columnType) {
  return async (dispatch, getState) => {
    const finalTableId = uuidv4();
    const finalColId = uuidv4();

    const finalCol = new ClassColumnJsonSchema(
      finalColId,
      newPropertyName,
      finalTableId,
      false,
      false,
      "",
      ""
    );
    const finalTable = new ClassTableJsonSchema(
      finalTableId,
      columnType,
      [],
      null,
      true,
      columnType,
      TableControlTypesJson.STANDARD,
      ""
    );

    finalTable.visible = false;

    await dispatch(fetchTable(finalTable));
    const mainDiagram = _.find(getState().diagrams, ["main", true]);
    const cntVisibleItems = _.size(
      _.filter(getState().tables, ["visible", true])
    );
    const positionX = cntVisibleItems * 200;
    const di = new ClassDiagramItem(finalTable.id, positionX, 40, 60, 160);

    await dispatch(addDiagramItems(mainDiagram.id, [di]));

    await dispatch(
      fetchColumn(finalCol, table.id, _.size(getState().tables[table.id].cols))
    );

    await dispatch(
      fetchColumnAndCatalog({
        childTableId: finalTableId,
        parentColumn: finalCol,
        parentTableId: table.id
      })
    );
  };
}

function addColToExistingIntermediaryKeyTable(
  finalCol,
  intermediaryTable,
  newPropertyName,
  isUnique
) {
  return async (dispatch, getState) => {
    finalCol.name = isUnique
      ? newPropertyName
      : newPropertyName +
        _.size(getState().tables[intermediaryTable.datatype].cols);
    await dispatch(
      fetchColumn(
        finalCol,
        getState().tables[intermediaryTable.datatype].id,
        _.size(getState().tables[intermediaryTable.datatype].cols)
      )
    );

    await dispatch(
      fetchColumnAndCatalog({
        childTableId: finalCol.datatype,
        parentColumn: finalCol,
        parentTableId: getState().tables[intermediaryTable.datatype].id
      })
    );
  };
}

export function createIntermediaryKeyTable(
  tableIdFromUrl,
  intermediaryKeyCaption, // PROPERTIES | PATTERN PROPERTIES ...
  intermediaryTableId,
  finalCol,
  intermediaryKeyType // KEYARRAY | KEYOBJECT | KEY,
) {
  return async (dispatch, getState) => {
    const tempColId = uuidv4();
    const intermediaryTable = new ClassTableJsonSchema(
      intermediaryTableId,
      "-",
      finalCol !== null ? [finalCol] : [],
      null,
      true,
      intermediaryKeyType,
      TableControlTypesJson.STANDARD,
      ""
    );
    intermediaryTable.visible = false;
    await dispatch(fetchTable(intermediaryTable));
    const mainDiagram = _.find(getState().diagrams, ["main", true]);
    const cntVisibleItems = _.size(
      _.filter(getState().tables, ["visible", true])
    );
    const positionX = cntVisibleItems * 200;
    const di = new ClassDiagramItem(
      intermediaryTableId,
      positionX,
      40,
      60,
      160
    );

    await dispatch(addDiagramItems(mainDiagram.id, [di]));

    //prepare col for properties

    var intermediaryCol = new ClassColumnJsonSchema(
      tempColId,
      intermediaryKeyCaption, // properties | patternProperties etc.
      intermediaryTableId,
      false,
      false,
      "",
      ""
    );

    await dispatch(
      fetchColumn(
        intermediaryCol,
        tableIdFromUrl,
        _.size(getState().tables[tableIdFromUrl].cols)
      )
    );

    await dispatch(
      fetchColumnAndCatalog({
        childTableId: intermediaryTableId,
        parentColumn: intermediaryCol,
        parentTableId: tableIdFromUrl
      })
    );
  };
}

export function convertJsonItemToGlobalDef(column) {
  return async (dispatch, getState) => {
    await dispatch(
      updateTableProperty(column.datatype, column.name ?? "Subschema", "name")
    );

    const modifiedTable = { ...getState().tables[column.datatype] };
    modifiedTable.nodeType = TableControlTypesJson.SUBSCHEMA;
    modifiedTable.visible = true;
    await dispatch(fetchTable(modifiedTable));
    await dispatch(
      removeChildTable({
        childTableId: modifiedTable.id
      })
    );

    const mainDiagram = _.find(getState().diagrams, ["main", true]);
    const cntVisibleItems = _.size(
      _.filter(getState().tables, ["visible", true])
    );
    const positionX = cntVisibleItems * 200;
    const di = new ClassDiagramItem(column.datatype, positionX, 40, 60, 160);
    di.background = "#8bc34a";
    await dispatch(addDiagramItems(mainDiagram.id, [di]));
  };
}

export function switchEmbeddable(historyContext, tableId, isEmbeddable) {
  return async (dispatch, getState) => {
    const state = getState();
    if (
      state.model.type === ModelTypes.MONGODB ||
      state.model.type === ModelTypes.MONGOOSE
    ) {
      const table = state.tables[tableId];
      if (table.embeddable === false) {
        await dispatch(convertCollectionToDocument(historyContext, table));
      } else {
        await dispatch(convertDocumentToCollection(table));
      }

      await dispatch(
        changeBackground(table.id, isEmbeddable ? "#8bc34a" : "#03a9f4")
      );

      getCurrentHistoryTransaction().addResizeRequest({
        domToModel: false,
        operation: "convertEmbeddable"
      });

      await dispatch(updateTableProperty(tableId, isEmbeddable, "embeddable"));
    }
  };

  function convertDocumentToCollection(table) {
    return async (dispatch) => {
      const convertedCollection = addKeyWithIdToCollection(table);
      await dispatch(fetchTable(convertedCollection));
    };
  }
}

function convertCollectionToDocument(historyContext, table) {
  return async (dispatch) => {
    await dispatch(removeId(historyContext, table));
    await dispatch(removeAllTableRelations(historyContext, table));
    await dispatch(removeAllColumnsFromKeys(historyContext, table));
    await dispatch(removeAllColumnsFromIndexes(table));
  };
}

function addKeyWithIdToCollection(table) {
  const newColId = uuidv4();
  const newCol = new ClassColumn(
    newColId,
    "_id",
    MongoDbHelpers.getMongoDBKeyType(),
    true,
    true
  );
  const newCols = [newCol, ...table.cols];
  const newKeys = [
    {
      id: uuidv4(),
      name: "Primary key",
      isPk: true,
      using: "na",
      cols: [{ id: uuidv4(), colid: newColId }]
    }
  ];
  return new ClassTableMongoDb(table.id, table.name, newCols, newKeys, false, {
    validationLevel: table.validationLevel,
    validationAction: table.validationAction,
    collation: table.collation,
    others: table.others
  });
}

function changeBackground(tableId, background) {
  return async (dispatch, getState) => {
    const state = getState();
    for (const diagram of _.map(state.diagrams, (i) => i)) {
      for (const diagramItem of _.map(diagram.diagramItems, (i) => i)) {
        if (tableId === diagramItem.referencedItemId) {
          await dispatch(
            updateDiagramItemProperty(
              diagram.id,
              diagramItem.referencedItemId,
              background,
              "background"
            )
          );
        }
      }
    }
  };
}

function removeAllColumnsFromIndexes(table) {
  return async (dispatch) => {
    for (const index of table.indexes) {
      for (const indexcol of index.cols) {
        await dispatch(
          removeColumnFromIndex(indexcol.colid, table.id, index.id)
        );
      }
    }
  };
}

function removeAllColumnsFromKeys(historyContext, table) {
  return async (dispatch) => {
    for (const key of table.keys) {
      for (const keycol of key.cols) {
        await dispatch(
          removeColumnFromKey(historyContext, keycol.colid, table.id, key.id)
        );
      }
    }
  };
}

function removeAllTableRelations(historyContext, table) {
  return async (dispatch) => {
    for (const relationIds of table.relations) {
      await dispatch(deleteRelation(historyContext, relationIds));
    }
  };
}

function removeId(historyContext, table) {
  return async (dispatch) => {
    const col = _.find(table.cols, ["name", "_id"]);
    if (!!col) {
      await dispatch(deleteColumnById(table.id, col.id));
      if (historyContext.state.columnId === col.id) {
        navigateByObjectType(
          historyContext,
          ObjectType.TABLE,
          table,
          undefined
        );
      }
    }
  };
}

function checkColExistInRels(relationsArray, columnId, relations) {
  var cnt = 0;
  for (var r of relationsArray) {
    var rObj = relations[r];
    cnt += _.size(_.filter(rObj.cols, ["childcol", columnId]));
    cnt += _.size(_.filter(rObj.cols, ["parentcol", columnId]));
  }

  return cnt;
}

export function changeKey(newKeyId, relationId) {
  return async (dispatch, getState) => {
    const state = getState();
    const relation = state.relations[relationId];
    const parent = state.tables[relation.parent];
    const newRelation = _.cloneDeep(relation);
    const newChild = _.cloneDeep(state.tables[newRelation.child]);
    const parentTableInFkCols = state.model.parentTableInFkCols;
    const caseConvention = state.model.caseConvention;
    const relations = state.relations;
    const tables = state.tables;

    const autoGeneratedRelations = getAutoGeneratedRelations(
      {
        type: state.model.type,
        nameAutoGeneration: state.model.nameAutoGeneration
      },
      state.relations,
      { [newChild.id]: newChild }
    );

    const colsToUpdateFkProperty = [...newRelation.cols];

    for (var chc of newRelation.cols) {
      if (
        checkColExistInRels(newChild.relations, chc.childcol, relations) === 1
      ) {
        newChild.cols = _.reject(newChild.cols, {
          id: chc.childcol
        });
      }
    }

    newRelation.cols = [];

    var newParentKey = _.find(parent.keys, ["id", newKeyId]);
    var newParentKeyCols = newParentKey.cols;
    for (let nc of newParentKeyCols) {
      var parentTableColId = nc.colid;
      var childTableColId = uuidv4();

      var colToAdd = _.cloneDeep(_.find(parent.cols, ["id", nc.colid]));
      colToAdd.id = childTableColId;
      if (parentTableInFkCols === true) {
        if (caseConvention === "under") {
          colToAdd.name = parent.name + "_" + colToAdd.name;
        } else {
          colToAdd.name = parent.name + _.upperFirst(colToAdd.name);
        }
      }
      colToAdd.pk = false;
      colToAdd.fk = true;
      newChild.cols = [...newChild.cols, colToAdd];
      await dispatch(fetchTable(newChild));

      var colspair = {
        id: uuidv4(),
        parentcol: parentTableColId,
        childcol: childTableColId
      };
      newRelation.cols = [...newRelation.cols, colspair];
    }
    newRelation.parent_key = newKeyId;
    await dispatch(fetchRelation(newRelation));
    for (const childColFk of colsToUpdateFkProperty) {
      await dispatch(
        updateChildColumnFkProperty(newRelation.child, childColFk.childcol)
      );
    }

    if (autoGeneratedRelations.length > 0) {
      await dispatch(updateRelationNames(autoGeneratedRelations));
    }
  };
}

export function deleteColumnFromAllObjects(historyContext, tableId, colId) {
  return async (dispatch, getState) => {
    const state = getState();
    const table = state.tables[tableId];

    for (var k of table.keys) {
      await dispatch(removeColumnFromKey(historyContext, colId, tableId, k.id));
    }
    for (var i of table.indexes) {
      await dispatch(removeColumnFromIndexByColumnId(colId, tableId, i.id));
    }
    var colPosition = _.findIndex(table.cols, ["id", colId]);
    await dispatch(deleteColumn(tableId, colPosition, colId));

    getCurrentHistoryTransaction().addResizeRequest({
      domToModel: true,
      operation: "deleteCol"
    });

    if (historyContext.state.columnId === colId) {
      navigateByObjectType(historyContext, ObjectType.TABLE, table, undefined);
    }
  };
}

function isKeyNameModifiedByUser({ key, generated }) {
  return generated === key.name;
}

export function getAutoGeneratedKeys(
  { type, nameAutoGeneration },
  tables,
  table,
  column
) {
  if (type !== ModelTypes.PG || !nameAutoGeneration.keys) {
    return [];
  }
  const tableKeys = column
    ? PGHelpers.getTableKeyWithColumn(table, column)
    : PGHelpers.getTableKey(table);

  return _.filter(
    _.map(tableKeys, (key) => ({
      key,
      generated: PGHelpers.makeKeyName(key, table, tables)
    })),
    isKeyNameModifiedByUser
  );
}

export function updateKeyIndexNames(
  tableId,
  autoGeneratedKeys,
  autoGeneratedIndexes
) {
  return async (dispatch, getState) => {
    const state = getState();
    const table = state.tables[tableId];

    const modifiedTable = Object.assign({}, table);
    modifiedTable.keys = autoGenerateKeys(
      modifiedTable,
      autoGeneratedKeys,
      state.tables
    );
    modifiedTable.indexes = autoGenerateIndexes(
      modifiedTable,
      autoGeneratedIndexes,
      state.tables
    );
    await dispatch(fetchTable(modifiedTable));
  };
}

export function autoGenerateKeys(modifiedTable, autoGeneratedKeys, tables) {
  return _.map(modifiedTable.keys, (key) => {
    const autoGeneratedKey = _.find(
      autoGeneratedKeys,
      (keyToMatch) => keyToMatch.key.id === key.id
    );
    if (autoGeneratedKey) {
      const generatedNewKeyName = PGHelpers.makeKeyName(
        key,
        modifiedTable,
        tables
      );
      return { ...key, name: generatedNewKeyName };
    }
    return key;
  });
}

function isIndexNameModifiedByUser({ index, generated }) {
  return generated === index.name;
}

function isRelationNameModifiedByUser({ relation, generated }) {
  return generated === relation.name;
}

export function getAutoGeneratedIndexes(settings, tables, table, column) {
  if (settings.type !== ModelTypes.PG || !settings.nameAutoGeneration.indexes) {
    return [];
  }
  const tableIndexes = column
    ? PGHelpers.getTableIndexWithColumn(table, column)
    : PGHelpers.getTableIndex(table);
  return _.filter(
    _.map(tableIndexes, (index) => ({
      index,
      generated: PGHelpers.makeIndexName(index, table, tables)
    })),
    isIndexNameModifiedByUser
  );
}

export function getAutoGeneratedRelations(settings, relations, tables, column) {
  if (
    settings.type !== ModelTypes.PG ||
    !settings.nameAutoGeneration.relations
  ) {
    return [];
  }
  const tableRelations = column
    ? PGHelpers.getTableRelationWithColumn(relations, tables, column)
    : PGHelpers.getTableRelation(relations, tables);
  return _.filter(
    _.map(tableRelations, (relation) => ({
      relation,
      generated: PGHelpers.makeRelationName(relation, tables, relations)
    })),
    isRelationNameModifiedByUser
  );
}

export function updateIndexNames(tableId, autoGeneratedIndexes) {
  return async (dispatch, getState) => {
    const state = getState();
    const table = state.tables[tableId];

    const modifiedTable = Object.assign({}, table);
    modifiedTable.indexes = autoGenerateIndexes(
      modifiedTable,
      autoGeneratedIndexes,
      state.tables
    );
    await dispatch(fetchTable(modifiedTable));
  };
}

export function autoGenerateIndexes(
  modifiedTable,
  autoGeneratedIndexes,
  tables
) {
  return _.map(modifiedTable.indexes, (index) => {
    const autoGeneratedKey = _.find(
      autoGeneratedIndexes,
      (indexToMatch) => indexToMatch.index.id === index.id
    );
    if (autoGeneratedKey) {
      const generatedNewKeyName = PGHelpers.makeIndexName(
        index,
        modifiedTable,
        tables
      );
      return { ...index, name: generatedNewKeyName };
    }
    return index;
  });
}
