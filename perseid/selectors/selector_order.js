import { GROUPS } from "../actions/order";
import { ModelTypes } from "../enums/enums";
import { OtherObjectTypes } from "../classes/class_other_object";
import _ from "lodash";
import { createSelector } from "reselect";
import { orderCompositesByDependencies } from "../platforms/pg/composite_order_list";
import { orderTablesByInheritance } from "../platforms/pg/order_tables";

const othersSelector = state =>
  _.filter(state.otherObjects, obj => obj.type === OtherObjectTypes.Other);
const otherTypesSelector = state =>
  _.filter(state.otherObjects, obj => obj.type === OtherObjectTypes.TypeOther);
const sequencesSelector = state =>
  _.filter(state.otherObjects, obj => obj.type === OtherObjectTypes.Sequence);
const enumsSelector = state =>
  _.filter(state.otherObjects, obj => obj.type === OtherObjectTypes.Enum);
const domainsSelector = state =>
  _.filter(state.otherObjects, obj => obj.type === OtherObjectTypes.Domain);
const compositesSelector = state =>
  _.filter(state.tables, obj => obj.objectType === "composite");
const functionsSelector = state =>
  _.filter(state.otherObjects, obj => obj.type === OtherObjectTypes.Function);
const proceduresSelector = state =>
  _.filter(state.otherObjects, obj => obj.type === OtherObjectTypes.Procedure);
const viewsSelector = state =>
  _.filter(state.otherObjects, obj => obj.type === OtherObjectTypes.View);
const materializedViewSelector = state =>
  _.filter(
    state.otherObjects,
    obj => obj.type === OtherObjectTypes.MaterializedView
  );
const tablesSelector = state =>
  _.filter(
    state.tables,
    obj =>
      (obj.objectType === "table" || obj.objectType === undefined) &&
      !obj.embeddable
  );
const relationsSelector = state => state.relations;
const linesSelector = state => state.lines;
const triggersSelector = state =>
  _.filter(state.otherObjects, obj => obj.type === OtherObjectTypes.Trigger);
const rulesSelector = state =>
  _.filter(state.otherObjects, obj => obj.type === OtherObjectTypes.Rule);
const policiesSelector = state =>
  _.filter(state.otherObjects, obj => obj.type === OtherObjectTypes.Policy);

const ITEM_NOT_FOUND = -1;

function getGroupItem(groupId, items, orderModelIds) {
  return _.map(items, item => {
    const orderIndex = orderModelIds
      ? orderModelIds.indexOf(item.id)
      : ITEM_NOT_FOUND;
    return {
      groupId,
      order:
        orderIndex !== ITEM_NOT_FOUND ? orderIndex : Number.MAX_SAFE_INTEGER,
      name: item.name,
      item
    };
  });
}

function orderedItemsGroupsPg(state) {
  return [
    ...getGroupItem(GROUPS.OTHER_GROUP, othersSelector(state), state.order),
    ...getGroupItem(
      GROUPS.OTHER_TYPE_GROUP,
      otherTypesSelector(state),
      state.order
    ),
    ...getGroupItem(
      GROUPS.SEQUENCE_GROUP,
      sequencesSelector(state),
      state.order
    ),
    ...getGroupItem(GROUPS.ENUM_GROUP, enumsSelector(state), state.order),
    ...getGroupItem(GROUPS.DOMAIN_GROUP, domainsSelector(state), state.order),
    ...getGroupItem(
      GROUPS.COMPOSITE_GROUP,
      compositesSelector(state),
      state.order
    ),
    ...getGroupItem(
      GROUPS.FUNCTION_GROUP,
      functionsSelector(state),
      state.order
    ),
    ...getGroupItem(
      GROUPS.PROCEDURE_GROUP,
      proceduresSelector(state),
      state.order
    ),
    ...getGroupItem(GROUPS.TABLE_GROUP, tablesSelector(state), state.order),
    ...getGroupItem(
      GROUPS.RELATION_GROUP,
      relationsSelector(state),
      state.order
    ),
    ...getGroupItem(GROUPS.VIEW_GROUP, viewsSelector(state), state.order),
    ...getGroupItem(
      GROUPS.MATERIALIZED_VIEW_GROUP,
      materializedViewSelector(state),
      state.order
    ),
    ...getGroupItem(GROUPS.RULE_GROUP, rulesSelector(state), state.order),
    ...getGroupItem(GROUPS.POLICY_GROUP, policiesSelector(state), state.order),
    ...getGroupItem(GROUPS.TRIGGER_GROUP, triggersSelector(state), state.order),
    ...getGroupItem(GROUPS.LINE_GROUP, linesSelector(state), state.order)
  ];
}

function orderedItemsGroupsMySQLFamily(state) {
  return [
    ...getGroupItem(GROUPS.OTHER_GROUP, othersSelector(state), state.order),
    ...getGroupItem(
      GROUPS.FUNCTION_GROUP,
      functionsSelector(state),
      state.order
    ),
    ...getGroupItem(
      GROUPS.PROCEDURE_GROUP,
      proceduresSelector(state),
      state.order
    ),
    ...getGroupItem(GROUPS.TABLE_GROUP, tablesSelector(state), state.order),
    ...getGroupItem(
      GROUPS.RELATION_GROUP,
      relationsSelector(state),
      state.order
    ),
    ...getGroupItem(GROUPS.VIEW_GROUP, viewsSelector(state), state.order),
    ...getGroupItem(GROUPS.TRIGGER_GROUP, triggersSelector(state), state.order),
    ...getGroupItem(GROUPS.LINE_GROUP, linesSelector(state), state.order)
  ];
}

function orderedItemsGroupsSQLite(state) {
  return [
    ...getGroupItem(GROUPS.OTHER_GROUP, othersSelector(state), state.order),
    ...getGroupItem(GROUPS.TABLE_GROUP, tablesSelector(state), state.order),
    ...getGroupItem(
      GROUPS.RELATION_GROUP,
      relationsSelector(state),
      state.order
    ),
    ...getGroupItem(GROUPS.VIEW_GROUP, viewsSelector(state), state.order),
    ...getGroupItem(GROUPS.TRIGGER_GROUP, triggersSelector(state), state.order),
    ...getGroupItem(GROUPS.LINE_GROUP, linesSelector(state), state.order)
  ];
}

function orderedOrderGroupItemsByUser(orderedItemsGroups) {
  return _.sortBy(orderedItemsGroups, ["order", "groupId", "name"]);
}

function orderedItemsByUser(orderedItemsGroups) {
  return _.map(
    orderedOrderGroupItemsByUser(orderedItemsGroups),
    item => item.item
  );
}

function orderedItemsByDefault(orderedItemsGroups) {
  return _.map(
    _.sortBy(orderedItemsGroups, ["groupId", "name"]),
    item => item.item
  );
}

function orderTables(orderedItemsGroups) {
  const allTables = orderedItemsGroups
    .filter(
      orderedItemsGroup => orderedItemsGroup.groupId === GROUPS.TABLE_GROUP
    )
    .map(orderedItemsGroup => orderedItemsGroup.item);

  const orderedTables = orderTablesByInheritance(allTables);

  orderedTables.forEach((orderedTable, index) => {
    const foundOrderItemGroup = orderedItemsGroups.find(
      orderItemGroup => orderItemGroup.item.id === orderedTable.id
    );
    if (foundOrderItemGroup) {
      foundOrderItemGroup.groupOrder = index;
    }
  });
}

function orderComposites(orderedItemsGroups) {
  const allComposites = orderedItemsGroups
    .filter(
      orderedItemsGroup => orderedItemsGroup.groupId === GROUPS.COMPOSITE_GROUP
    )
    .map(orderedItemsGroup => orderedItemsGroup.item)
    .sort((compA, compB) => compA.name.localeCompare(compB.name));

  const orderedComposites = orderCompositesByDependencies(allComposites);

  orderedComposites.forEach((id, index) => {
    const foundOrderItemGroup = orderedItemsGroups.find(
      orderItemGroup => orderItemGroup.item.id === id
    );
    if (foundOrderItemGroup) {
      foundOrderItemGroup.groupOrder = index;
    }
  });
}

function orderedItemsByDefaultPg(orderedItemsGroups) {
  orderTables(orderedItemsGroups);
  orderComposites(orderedItemsGroups);

  return orderedItemsGroups
    .sort((a, b) => {
      const groupsDiff = a.groupId - b.groupId;
      if (groupsDiff !== 0) {
        return groupsDiff;
      }
      if (
        a.groupId === GROUPS.TABLE_GROUP ||
        a.groupId === GROUPS.COMPOSITE_GROUP
      ) {
        return a.groupOrder - b.groupOrder;
      }
      return a.name.localeCompare(b.name);
    })
    .map(orderedItemsGroup => orderedItemsGroup.item);
}

function getLastPositionInGroup(orderedItemsGroups, groupId) {
  return _.reduce(
    orderedItemsGroups,
    (result, item) => {
      const currentOrder = item.order;
      const currentGroupId = item.groupId;
      if (currentGroupId === groupId) {
        return result === undefined
          ? currentOrder
          : Math.max(currentOrder, result);
      }
      return result;
    },
    undefined
  );
}

function getAllGroupIds(groupId) {
  const result = [];
  let index = 0;
  while (index <= groupId) {
    result.push(index);
    index++;
  }
  return result;
}

function getNewPosition(orderedItemsGroups, itemGroupId) {
  const groupIds = getAllGroupIds(itemGroupId);
  while (groupIds.length !== 0) {
    const groupId = groupIds.pop();
    const lastPositionInGroup = getLastPositionInGroup(
      orderedItemsGroups,
      groupId
    );
    if (lastPositionInGroup !== undefined) {
      return lastPositionInGroup + 1;
    }
  }
  return undefined;
}

function syncOrderProperty(items) {
  return items.map((item, index) => ({
    ...item,
    order: index
  }));
}

function orderedItemsForNewObject(orderedItemsGroups) {
  const unknownOrderItems = _.orderBy(
    _.filter(
      orderedItemsGroups,
      item => item.order === Number.MAX_SAFE_INTEGER
    ),
    [item => item.name.toLowerCase()]
  );

  let knownOrderedItems = _.filter(
    orderedOrderGroupItemsByUser(orderedItemsGroups),
    item => item.order !== Number.MAX_SAFE_INTEGER
  );

  unknownOrderItems.forEach(item => {
    const newPosition = getNewPosition(knownOrderedItems, item.groupId);
    if (newPosition !== undefined) {
      knownOrderedItems.splice(newPosition, 0, item);
    } else {
      knownOrderedItems.splice(0, 0, item);
    }
    knownOrderedItems = syncOrderProperty(knownOrderedItems);
  });
  return _.map(knownOrderedItems, item => item.item);
}

const getOrderedObjectsPg = createSelector(
  orderedItemsGroupsPg,
  orderedItemsByUser
);
const getOrderedObjectsDefaultPg = createSelector(
  orderedItemsGroupsPg,
  orderedItemsByDefaultPg
);

const getOrderedObjectsForNewObjectPg = createSelector(
  orderedItemsGroupsPg,
  orderedItemsForNewObject
);

const getOrderedObjectsMySQLFamily = createSelector(
  orderedItemsGroupsMySQLFamily,
  orderedItemsByUser
);
const getOrderedObjectsDefaultMySQLFamily = createSelector(
  orderedItemsGroupsMySQLFamily,
  orderedItemsByDefault
);

const getOrderedObjectsForNewObjectMySQLFamily = createSelector(
  orderedItemsGroupsMySQLFamily,
  orderedItemsForNewObject
);

const getOrderedObjectsSQLite = createSelector(
  orderedItemsGroupsSQLite,
  orderedItemsByUser
);

const getOrderedObjectsDefaultSQLite = createSelector(
  orderedItemsGroupsSQLite,
  orderedItemsByDefault
);

const getOrderedObjectsForNewObjectSQLite = createSelector(
  orderedItemsGroupsSQLite,
  orderedItemsForNewObject
);

const orderedObjectsEmpty = () => {
  return [];
};
const getOrderedObjectsEmpty = createSelector(orderedObjectsEmpty);

export const getOrderedObjectsReset = modelType => {
  if (modelType === ModelTypes.PG) {
    return getOrderedObjectsDefaultPg;
  } else if (
    modelType === ModelTypes.MARIADB ||
    modelType === ModelTypes.MYSQL
  ) {
    return getOrderedObjectsDefaultMySQLFamily;
  } else if (modelType === ModelTypes.SQLITE) {
    return getOrderedObjectsDefaultSQLite;
  } else {
    return getOrderedObjectsEmpty;
  }
};

export const getOrderedObjects = modelType => {
  if (modelType === ModelTypes.PG) {
    return getOrderedObjectsPg;
  } else if (
    modelType === ModelTypes.MARIADB ||
    modelType === ModelTypes.MYSQL
  ) {
    return getOrderedObjectsMySQLFamily;
  } else if (modelType === ModelTypes.SQLITE) {
    return getOrderedObjectsSQLite;
  } else {
    return getOrderedObjectsEmpty;
  }
};

export const getOrderedObjectsForNewObject = modelType => {
  if (modelType === ModelTypes.PG) {
    return getOrderedObjectsForNewObjectPg;
  } else if (
    modelType === ModelTypes.MARIADB ||
    modelType === ModelTypes.MYSQL
  ) {
    return getOrderedObjectsForNewObjectMySQLFamily;
  } else if (modelType === ModelTypes.SQLITE) {
    return getOrderedObjectsForNewObjectSQLite;
  } else {
    return getOrderedObjectsEmpty;
  }
};
