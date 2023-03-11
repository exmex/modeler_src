import { Item, ModelObjects, OtherObjectTypes } from "common";

interface OrderedItemsGroup {
  group_id: number;
  order: number;
  name: string;
  item: Item;
}

export const GROUPS = {
  OTHER_GROUP: 0,
  TABLE_GROUP: 1,
  RELATION_GROUP: 2,
  VIEW_GROUP: 3,
  TRIGGER_GROUP: 4,
  LINE_GROUP: 5
};

const ORDER_FIELD = "order";
const GROUP_ID_FIELD = "group_id";
const NAME_FIELD = "name";
const ITEM_FIELD = "item";
const ITEM_NOT_FOUND = -1;

export class SQLiteOrderBuilder {
  reorder(modelWithoutOrder: ModelObjects): string[] {
    const standardOrder = this.orderedItemsByDefault(
      this.orderedItemsGroupsPg(modelWithoutOrder)
    );

    return standardOrder;
  }

  orderedItemsByDefault(orderedItemsGroups: OrderedItemsGroup[]): string[] {
    const sortedByGroups = [...orderedItemsGroups].sort(
      (a, b) => a.group_id - b.group_id
    );
    return sortedByGroups.map((item) => item.item.id);
  }

  orderedItemsGroupsPg(model: ModelObjects) {
    return [
      ...this.getGroupItem(
        GROUPS.OTHER_GROUP,
        this.othersSelector(model),
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

  viewsSelector(model: ModelObjects) {
    return Object.keys(model.otherObjects)
      .map((key) => model.otherObjects[key])
      .filter((obj) => obj.type === OtherObjectTypes.View);
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
}
