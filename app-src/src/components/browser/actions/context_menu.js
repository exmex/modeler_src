import {
  DROPDOWN_MENU,
  DROPDOWN_MENU_SOURCE,
  openDropDownMenu,
  setForcedRender
} from "../../../actions/ui";

import { ObjectType } from "../../../enums/enums";
import _ from "lodash";
import { clearSelection } from "../../../actions/selections";

const getContextMenuType = (propertyObjectType) => {
  switch (propertyObjectType) {
    case ObjectType.TABLE:
    case ObjectType.NOTE:
    case ObjectType.OTHER_OBJECT:
      return DROPDOWN_MENU.DIAGRAM_ITEM;
    case ObjectType.RELATION:
      return DROPDOWN_MENU.RELATION;
    case ObjectType.LINE:
      return DROPDOWN_MENU.LINE;
    default:
      return undefined;
  }
};

export const showObjectContextMenu = (
  { item, index },
  { x, y },
  selections,
  navigateToIndex
) => {
  return async (dispatch) => {
    if (!item.source.selectableItems) {
      await dispatch(clearSelection(true));
      await dispatch(setForcedRender({ domToModel: false }));
      navigateToIndex(index, false);
    } else {
      const isInSelection = !!_.find(
        selections,
        (selectionItem) => selectionItem.objectId === item.object?.id
      );
      navigateToIndex(index, isInSelection);
    }

    const contextMenuType = getContextMenuType(item.source.propertyObjectType);

    if (contextMenuType) {
      await dispatch(
        openDropDownMenu(contextMenuType, DROPDOWN_MENU_SOURCE.LIST, {
          x,
          y
        })
      );
    }
  };
};
