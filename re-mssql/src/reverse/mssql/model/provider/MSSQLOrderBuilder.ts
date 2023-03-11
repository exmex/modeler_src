import { Item, ModelObjects, OtherObjectTypes } from "common";

import { DependenciesRegistry } from "re";

interface OrderedItemsGroup {
  group_id: number;
  order: number;
  name: string;
  item: Item;
}

export const GROUPS = {
  OTHER_GROUP: 0,
  USER_DEFINED_TYPE_GROUP: 1,
  ENUM_GROUP: 2,
  SEQUENCE_GROUP: 5,
  TABLE_GROUP: 6,
  RELATION_GROUP: 7,
  FUNCTION_GROUP: 8,
  PROCEDURE_GROUP: 9,
  VIEW_GROUP: 10,
  MATERIALIZED_VIEW_GROUP: 11,
  TRIGGER_GROUP: 12,
  LINE_GROUP: 15
};

const ORDER_FIELD = "order";
const GROUP_ID_FIELD = "group_id";
const NAME_FIELD = "name";
const ITEM_FIELD = "item";
const ITEM_NOT_FOUND = -1;

export class MSSQLOrderBuilder {
  constructor(private dependenciesRegistry: DependenciesRegistry) {}

  reorder(modelWithoutOrder: ModelObjects): string[] {
    const standardOrder = this.orderedItemsByDefault(
      this.orderedItemsGroupsMSSQL(modelWithoutOrder)
    );

    return this.dependenciesRegistry.orderObjects(standardOrder);
  }

  orderedItemsByDefault(orderedItemsGroups: OrderedItemsGroup[]): string[] {
    const sortedByGroups = [...orderedItemsGroups].sort(
      (a, b) => a.group_id - b.group_id
    );
    return sortedByGroups.map((item) => item.item.id);
  }

  orderedItemsGroupsMSSQL(model: ModelObjects) {
    return [
      ...this.getGroupItem(
        GROUPS.OTHER_GROUP,
        this.othersSelector(model),
        model.order
      ),
      ...this.getGroupItem(
        GROUPS.USER_DEFINED_TYPE_GROUP,
        this.otherUserDefinedTypesSelector(model),
        model.order
      ),
      ...this.getGroupItem(
        GROUPS.SEQUENCE_GROUP,
        this.sequencesSelector(model),
        model.order
      ),
      ...this.getGroupItem(
        GROUPS.ENUM_GROUP,
        this.enumsSelector(model),
        model.order
      ),
      ...this.getGroupItem(
        GROUPS.FUNCTION_GROUP,
        this.functionsSelector(model),
        model.order
      ),
      ...this.getGroupItem(
        GROUPS.PROCEDURE_GROUP,
        this.proceduresSelector(model),
        model.order
      ),
      ...this.getGroupItem(
        GROUPS.TABLE_GROUP,
        this.tablesSelector(model),
        model.order
      ),
      ...this.getGroupItem(
        GROUPS.RELATION_GROUP,
        this.relationsSelector(model),
        model.order
      ),
      ...this.getGroupItem(
        GROUPS.VIEW_GROUP,
        this.viewsSelector(model),
        model.order
      ),
      ...this.getGroupItem(
        GROUPS.MATERIALIZED_VIEW_GROUP,
        this.materializedViewSelector(model),
        model.order
      ),
      ...this.getGroupItem(
        GROUPS.TRIGGER_GROUP,
        this.triggersSelector(model),
        model.order
      )
    ];
  }

  getGroupItem(
    groupId: number,
    collection: Item[],
    orderModelIds: string[]
  ): OrderedItemsGroup[] {
    return collection.map((item: Item) => {
      const orderId = orderModelIds.indexOf(item.id);
      return {
        [GROUP_ID_FIELD]: groupId,
        [ORDER_FIELD]:
          orderId !== ITEM_NOT_FOUND ? orderId : Number.MAX_SAFE_INTEGER,
        [NAME_FIELD]: item.name,
        [ITEM_FIELD]: item
      };
    });
  }

  othersSelector(model: ModelObjects) {
    return Object.keys(model.otherObjects)
      .map((key) => model.otherObjects[key])
      .filter((obj) => obj.type === OtherObjectTypes.Other);
  }

  otherUserDefinedTypesSelector(model: ModelObjects) {
    return Object.keys(model.otherObjects)
      .map((key) => model.otherObjects[key])
      .filter((obj) => obj.type === OtherObjectTypes.UserDefinedType);
  }

  sequencesSelector(model: ModelObjects) {
    return Object.keys(model.otherObjects)
      .map((key) => model.otherObjects[key])
      .filter((obj) => obj.type === OtherObjectTypes.Sequence);
  }

  enumsSelector(model: ModelObjects) {
    return Object.keys(model.otherObjects)
      .map((key) => model.otherObjects[key])
      .filter((obj) => obj.type === OtherObjectTypes.Enum);
  }

  domainsSelector(model: ModelObjects) {
    return Object.keys(model.otherObjects)
      .map((key) => model.otherObjects[key])
      .filter((obj) => obj.type === OtherObjectTypes.Domain);
  }

  compositesSelector(model: ModelObjects) {
    return Object.keys(model.tables)
      .map((key) => model.tables[key])
      .filter((obj) => obj.objectType === "composite");
  }

  functionsSelector(model: ModelObjects) {
    return Object.keys(model.otherObjects)
      .map((key) => model.otherObjects[key])
      .filter((obj) => obj.type === OtherObjectTypes.Function);
  }

  proceduresSelector(model: ModelObjects) {
    return Object.keys(model.otherObjects)
      .map((key) => model.otherObjects[key])
      .filter((obj) => obj.type === OtherObjectTypes.Procedure);
  }

  viewsSelector(model: ModelObjects) {
    return Object.keys(model.otherObjects)
      .map((key) => model.otherObjects[key])
      .filter((obj) => obj.type === OtherObjectTypes.View);
  }

  materializedViewSelector(model: ModelObjects) {
    return Object.keys(model.otherObjects)
      .map((key) => model.otherObjects[key])
      .filter((obj) => obj.type === OtherObjectTypes.MaterializedView);
  }

  tablesSelector(model: ModelObjects) {
    return Object.keys(model.tables)
      .map((key) => model.tables[key])
      .filter(
        (obj) =>
          (obj.objectType === "table" || obj.objectType === undefined) &&
          !obj.embeddable
      );
  }

  relationsSelector(model: ModelObjects) {
    return Object.keys(model.relations).map((key) => model.relations[key]);
  }

  triggersSelector(model: ModelObjects) {
    return Object.keys(model.otherObjects)
      .map((key) => model.otherObjects[key])
      .filter((obj) => obj.type === OtherObjectTypes.Trigger);
  }

  rulesSelector(model: ModelObjects) {
    return Object.keys(model.otherObjects)
      .map((key) => model.otherObjects[key])
      .filter((obj) => obj.type === OtherObjectTypes.Rule);
  }

  policiesSelector(model: ModelObjects) {
    return Object.keys(model.otherObjects)
      .map((key) => model.otherObjects[key])
      .filter((obj) => obj.type === OtherObjectTypes.Policy);
  }
}
