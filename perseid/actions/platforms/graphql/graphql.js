import { DiagramAreaMode, ModelTypes } from "../../../enums/enums";
import { addColumnToKey, fetchTable, updateColumnProperty } from "../../tables";

import { ClassRelationGraphQl } from "../../../platforms/graphql/class_relation_graphql";
import _ from "lodash";
import { fetchRelation } from "../../relations";
import { v4 as uuidv4 } from "uuid";

export function getForwardedFieldChanges(pName, model, tableId, columnId) {
  return model.model.type === ModelTypes.GRAPHQL &&
    isForwardedFieldProperty(pName)
    ? forwardedFieldChanges(model, tableId, columnId, pName)
    : [];
}

export function isFieldFromImplements(col, table, model) {
  if (col.fk === false) {
    return false;
  } else {
    let toReturn = false;
    _.map(table.relations, (relId) => {
      const relation = model.relations[relId];
      const parent = relation && model.tables[relation.parent];
      if (
        relation &&
        parent &&
        isInterface(parent) &&
        isImplementsRelation(relation)
      ) {
        const parent_key = getImplementsKey(parent);
        const implementsRelations = getImplementsRelations(
          parent,
          model,
          parent_key
        );

        _.map(implementsRelations, (ir) => {
          if (_.find(ir.cols, ["childcol", col.id]) !== undefined) {
            toReturn = true;
          }
        });
      }
    });
    return toReturn;
  }
}

export function forwardFieldChanges(
  grapqlForwardedFieldChanges,
  tableId,
  pName,
  newValue
) {
  return async (dispatch, getState) => {
    const model = getState();
    for (const forwardedField of grapqlForwardedFieldChanges) {
      const sourceTable = model.tables[tableId];
      const targetTable = model.tables[forwardedField.childId];
      const newFieldWithChanges = buildNewFieldWithChanges(
        sourceTable,
        forwardedField,
        pName,
        newValue
      );
      const otherNewFields = getOtherExistingFields(
        targetTable,
        forwardedField,
        newFieldWithChanges
      );
      const existingImplements = getExistingImplements(forwardedField, model);
      if (existsSameTargetField(otherNewFields)) {
        if (isLastMapping(existingImplements) === true) {
          await dispatch(removeRedundantTargetField(forwardedField));
        }
        await dispatch(redirectImplements(forwardedField, otherNewFields[0]));
      } else if (implmementsExistsButNotSameTargetAttr(existingImplements)) {
        if (isLastMapping(existingImplements) === true) {
          await dispatch(removeRedundantTargetField(forwardedField));
        }
        await dispatch(
          createNewTargetAttr(forwardedField, newFieldWithChanges)
        );
      } else {
        await dispatch(
          updateSingleImplementsTargetAttr(forwardedField, newValue, pName)
        );
      }
    }
  };
}

function updateSingleImplementsTargetAttr(forwardedField, newValue, pName) {
  return async (dispatch, getState) => {
    await dispatch(
      updateColumnProperty(
        forwardedField.childId,
        forwardedField.childColId,
        newValue,
        pName
      )
    );
  };
}

function implmementsExistsButNotSameTargetAttr(foundImplements) {
  return foundImplements.length > 0;
}

function existsSameTargetField(otherNewFields) {
  return otherNewFields.length > 0;
}

function isLastMapping(foundRelations) {
  return foundRelations.length === 1;
}

function redirectImplements(forwardedField, newTargetField) {
  return async (dispatch) => {
    const relation = _.cloneDeep(forwardedField.rel);
    relation.cols = relation.cols.filter(
      (col) => col.childcol !== forwardedField.childColId
    );
    relation.cols.push({
      id: uuidv4(),
      parentcol: forwardedField.parentColId,
      childcol: newTargetField.id
    });
    await dispatch(fetchRelation(relation));
  };
}

function removeRedundantTargetField(forwardedField) {
  return async (dispatch, getState) => {
    const model = getState();
    const targetTable = _.cloneDeep(model.tables[forwardedField.childId]);
    targetTable.cols = targetTable.cols.filter(
      (col) => col.id !== forwardedField.childColId
    );

    await dispatch(fetchTable(targetTable));
  };
}

function updateTargetField(
  forwardedField,
  newFieldWithChanges,
  historyContext
) {
  return async (dispatch, getState) => {
    const model = getState();
    const targetTable = _.cloneDeep(model.tables[forwardedField.childId]);
    const col = targetTable.cols.find(
      (col) => col.id === forwardedField.childColId
    );
    if (col) {
      getForwardedFieldProperties().forEach((propertyName) => {
        col[propertyName] = newFieldWithChanges[propertyName];
      });

      await dispatch(fetchTable(targetTable, true, historyContext));
    }
  };
}

function getOtherExistingFields(targetTable, forwardedField, attrWithChanges) {
  return targetTable.cols.filter(
    (col) =>
      col.id !== forwardedField.childColId &&
      getForwardedFieldProperties().reduce(
        (areForwardedFieldPropertyEqual, propertyName) =>
          areForwardedFieldPropertyEqual
            ? col[propertyName] === attrWithChanges[propertyName]
            : false,
        true
      )
  );
}

function buildNewFieldWithChanges(
  sourceTable,
  forwardedField,
  pName,
  newValue
) {
  const newAttr = _.cloneDeep(
    _.find(sourceTable.cols, ["id", forwardedField.parentColId])
  );
  if (newAttr) {
    newAttr.id = uuidv4();
    newAttr[pName] = newValue;
    newAttr.fk = true;
  }
  return newAttr;
}

function createNewTargetAttr(forwardedField, attrWithChanges) {
  return async (dispatch, getState) => {
    if (attrWithChanges.isHidden !== true) {
      const model = getState();
      const rel = _.cloneDeep(forwardedField.rel);
      const targetTable = _.cloneDeep(model.tables[forwardedField.childId]);
      targetTable.cols = [...targetTable.cols, attrWithChanges];
      await dispatch(fetchTable(targetTable));

      rel.cols = [
        ...rel.cols.filter(
          (keycol) => keycol.parentcol !== forwardedField.parentColId
        )
      ];

      forwardedField.rel = rel;

      await dispatch(redirectImplements(forwardedField, attrWithChanges));
    }
  };
}

function getExistingImplements(forwardedField, model) {
  return model.tables[forwardedField.childId].relations
    .map((relId) => model.relations[relId])
    .filter((rel) =>
      rel.cols.find((col) => col.childcol === forwardedField.childColId)
    );
}

function forwardedFieldChanges(model, tableId, columnId, pName) {
  const parentTable = model.tables[tableId];
  const parent_key = getImplementsKey(parentTable);
  const implementsRelations = getImplementsRelations(
    parentTable,
    model,
    parent_key
  );
  return findForwardedFieldChanges(
    implementsRelations,
    columnId,
    _.find(parentTable.cols, ["id", columnId])[pName]
  );
}

function findForwardedFieldChanges(
  implementsRelations,
  columnId,
  currentValue
) {
  return implementsRelations
    .map((rel) => ({
      currentValue,
      childId: rel.child,
      childColId: getForwardedChildAttrId(rel, columnId),
      parentColId: columnId,
      rel
    }))
    .filter((forwardedField) => !!forwardedField.childColId);
}

function getForwardedChildAttrId(rel, columnId) {
  return rel.cols.find((col) => col.parentcol === columnId)?.childcol;
}

function getImplementsRelations(table, model, parent_key) {
  return _.filter(
    _.map(table.relations, (relId) => model.relations[relId]),
    (rel) =>
      rel && isImplementsRelation(rel) && rel.parent_key === parent_key.id
  );
}

function isImplementsRelation(rel) {
  return rel.type === "identifying";
}

function getImplementsKey(table) {
  return _.find(table.keys, (key) => key.isPk === true);
}

function getForwardedFieldProperties() {
  return [
    "datatype",
    "name",
    "list",
    "nn",
    "isArrayItemNn",
    "fieldArguments",
    "fieldDirective"
  ];
}

function isForwardedFieldProperty(propertyName) {
  return getForwardedFieldProperties().includes(propertyName);
}

export function getGraphQLKey(isImplements, sourceTable) {
  if (isImplements) {
    return getGrapQLIdentifyingKey(sourceTable);
  } else {
    return getGraphQLSimpleKey(sourceTable);
  }
}

function getGraphQLSimpleKey(sourceTable) {
  const sourceTableKeys = sourceTable.keys;
  return _.find(sourceTableKeys, [
    "isPk",
    isInterface(sourceTable) ? false : true
  ]);
}

function isInterface(sourceTable) {
  return sourceTable.objectType === "interface";
}

function getGrapQLIdentifyingKey(sourceTable) {
  const sourceTableKeys = sourceTable.keys;
  return _.find(sourceTableKeys, [
    "isPk",
    isInterface(sourceTable) ? true : false
  ]);
}

export function createGraphQLRelationKey(isImplements, sourceTable) {
  if (isImplements) {
    return createGraphQLIdentifyingKey(sourceTable);
  }
  return createGraphQLSimpleKey(sourceTable);
}

function createGraphQLIdentifyingKey(sourceTable) {
  return {
    id: uuidv4(),
    name: "Identifier",
    isPk: isInterface(sourceTable) ? true : false,
    using: "na",
    cols: sourceTable.cols.map((col) => ({ id: uuidv4(), colid: col.id }))
  };
}

function createGraphQLSimpleKey(sourceTable) {
  return {
    id: uuidv4(),
    name: "Identifier",
    isPk: isInterface(sourceTable) ? false : true,
    using: "na",
    cols: sourceTable.cols
      .filter((col) => col.isHidden === true)
      .map((col) => ({ id: uuidv4(), colid: col.id }))
  };
}

export function createGraphQLRelationObject(
  state,
  isImplements,
  relid,
  relationKey,
  targetTable
) {
  const result = new ClassRelationGraphQl(
    relid,
    state.newRelation.sourceName + "-" + state.newRelation.targetName,
    relationKey.id,
    state.newRelation.sourceId,
    state.newRelation.targetId,
    [],
    isImplements ? "identifying" : "simple",
    ""
  );
  if (targetTable.objectType === "union") {
    result.c_ch = "one";
  }
  return result;
}

function implementsExists(relations, sourceTable, targetTable) {
  return !!targetTable.relations
    .map((relId) => relations[relId])
    .find(
      (rel) =>
        rel.parent === sourceTable.id &&
        rel.child === targetTable.id &&
        rel.type === "identifying"
    );
}

export function isGraphQLNotAllowed(
  type,
  relations,
  targetTable,
  sourceTable,
  currentDiagramAreaMode
) {
  const isGraphQL = type === ModelTypes.GRAPHQL;
  const isNotLine = currentDiagramAreaMode !== DiagramAreaMode.ADD_LINE;
  const isReferenceNotAllowed =
    currentDiagramAreaMode === DiagramAreaMode.ADD_RELATION &&
    ((sourceTable.objectType === "interface" &&
      targetTable.objectType === "union") ||
      (sourceTable.objectType === "union" &&
        targetTable.objectType === "union"));
  const isImplementsNotAllowed =
    currentDiagramAreaMode === DiagramAreaMode.ADD_IMPLEMENTS &&
    (!(
      sourceTable.objectType === "interface" &&
      targetTable.objectType === "type"
    ) ||
      implementsExists(relations, sourceTable, targetTable));

  return (
    isGraphQL && isNotLine && (isReferenceNotAllowed || isImplementsNotAllowed)
  );
}

export function updateGraphQLTargetColumn(
  type,
  newRelationObject,
  colToAdd,
  sourceTable,
  targetTable
) {
  if (type === ModelTypes.GRAPHQL && newRelationObject.type !== "identifying") {
    colToAdd.datatype = sourceTable.id;
    colToAdd.name = _.lowerFirst(sourceTable.name) + "s";
    colToAdd.isHidden = false;
    if (targetTable.objectType !== "union") {
      colToAdd.list = true;
    } else {
      colToAdd.list = false;
    }
    targetTable.objectType === "union" && (colToAdd.nn = false);
  }
}

export function graphQLUpdateColumnsAfterRelationAdded(newColumns) {
  return async (dispatch) => {
    for (const newColumn of newColumns) {
      const identifyingKey = getGrapQLIdentifyingKey(newColumn.targetTable);
      if (newColumn.newRelationObject.type === "simple" && identifyingKey) {
        await dispatch(
          addColumnToKey(
            newColumn.targetTable.id,
            newColumn.column.id,
            newColumn.targetTable.id,
            identifyingKey.id
          )
        );
      }
    }
  };
}
