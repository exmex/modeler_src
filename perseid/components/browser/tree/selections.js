import { ObjectType } from "../../../enums/enums";
import _ from "lodash";
import { buildInstancePathId } from "./definitions";
import { clearAddMultipleToSelection } from "../../../actions/selections";
import { setForcedRender } from "../../../actions/ui";

const getObjectType = (params) => {
  if (!!params.pid) {
    return ObjectType.MODEL;
  }
  if (!!params.id) {
    return ObjectType.TABLE;
  }
  if (!!params.oid) {
    return ObjectType.OTHER_OBJECT;
  }
  if (!!params.nid) {
    return ObjectType.NOTE;
  }
  if (!!params.rid) {
    return ObjectType.RELATION;
  }
  if (!!params.lid) {
    return ObjectType.LINE;
  }
  return undefined;
};

export const getFilteredSelections = (items) => {
  return _.reduce(
    _.filter(items, (item) => item.object && item.selected),
    (result, item) => {
      result[item.object.id] = {
        objectId: item.object.id,
        objectType: item.source.propertyObjectType,
        embedabble: item.object.embedabble
      };
      return result;
    },
    {}
  );
};

const shouldBeActive = (focused, item) => {
  const itemInstancePath = buildInstancePathId(item.instancePath);
  const hasPreciseBrowserPath =
    focused.instancePathId && itemInstancePath === focused.instancePathId;
  const hasGeneralObjectPath =
    !!item.object &&
    item?.object.id === focused.objectId &&
    (item.groupPath.length === 2 ||
      (item.groupPath.length === 3 &&
        (item?.source?.propertyObjectType === ObjectType.COLUMN ||
          item?.source?.propertyObjectType === ObjectType.INDEX)));
  return hasPreciseBrowserPath || hasGeneralObjectPath;
};

export const getActiveItemInfo = (currentActiveItemInfo, items, focused) => {
  const activeFocusedObjectIndex = items.findIndex((item) =>
    shouldBeActive(focused, item)
  );

  const objectType = focused?.objectType;
  if (activeFocusedObjectIndex >= 0 && !!objectType) {
    items[activeFocusedObjectIndex].isActive = true;
    return {
      item: items[activeFocusedObjectIndex],
      index: activeFocusedObjectIndex
    };
  }

  return undefined;
};

export const addAllItemsToSelection = (items) => {
  return async (dispatch) => {
    const selections = _.reduce(
      _.map(
        _.filter(
          items,
          (item) => !!item.object && item.source?.selectableItems
        ),
        (item) => ({
          objectId: item.object.id,
          objectType: item.source.propertyObjectType,
          embeddable: item.object.embeddable
        })
      ),
      (result, item) => ({ ...result, [item.objectId]: item }),
      {}
    );

    await dispatch(clearAddMultipleToSelection(selections));
    await dispatch(setForcedRender({ domToModel: false }));
  };
};
