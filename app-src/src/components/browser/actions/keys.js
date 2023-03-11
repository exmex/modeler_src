import {
  addToSelection,
  clearAddMultipleToSelection,
  removeFromSelection
} from "../../../actions/selections";
import {
  navigateKeyDown,
  navigateKeyEnd,
  navigateKeyHome,
  navigateKeyLeft,
  navigateKeyPageDown,
  navigateKeyPageUp,
  navigateKeyRight,
  navigateKeyUp
} from "./navigation";
import {
  setForcedRender,
  toggleConfirmDelete,
  toggleConfirmDeleteLine,
  toggleConfirmDeleteRelation
} from "../../../actions/ui";

import { ObjectType } from "../../../enums/enums";
import _ from "lodash";
import { addAllItemsToSelection } from "../tree/selections";
import { editObject } from "./edit_object";
import { getCurrentHistoryTransaction } from "../../../actions/undoredo";
import { showObjectContextMenu } from "./context_menu";

const CONTEXT_MENU_KEY = "ContextMenu";
const ENTER_KEY = "Enter";
const SPACE_KEY_CODE = 32;
const LEFT_KEY_CODE = 37;
const UP_KEY_CODE = 38;
const RIGHT_KEY_CODE = 39;
const DOWN_KEY_CODE = 40;
const PAGE_UP_KEY_CODE = 33;
const PAGE_DOWN_KEY_CODE = 34;
const HOME_KEY_CODE = 36;
const END_KEY_CODE = 35;
const BACKSPACE_KEY_CODE = 8;
const DELETE_KEY_CODE = 46;
const A_CODE = "a";

export const keyDown = async (
  dispatch,
  { ctrlMetaKey, keyCode, key, charCode },
  { activeItemInfo, items, filteredSelections },
  { pageSize, elementClientRect },
  navigateToIndex
) => {
  if (keyCode === SPACE_KEY_CODE) {
    dispatch(toggleSelection(activeItemInfo));
  } else if (ctrlMetaKey && charCode === A_CODE) {
    dispatch(addAllItemsToSelection(items));
  } else if (keyCode === UP_KEY_CODE) {
    navigateKeyUp({ activeItemInfo }, { navigateToIndex, ctrlMetaKey });
  } else if (keyCode === DOWN_KEY_CODE) {
    navigateKeyDown(
      { items, activeItemInfo },
      { navigateToIndex, ctrlMetaKey }
    );
  } else if (keyCode === PAGE_UP_KEY_CODE) {
    navigateKeyPageUp(
      { items, activeItemInfo, pageSize },
      { navigateToIndex, ctrlMetaKey }
    );
  } else if (keyCode === PAGE_DOWN_KEY_CODE) {
    navigateKeyPageDown(
      { items, activeItemInfo, pageSize },
      { navigateToIndex, ctrlMetaKey }
    );
  } else if (keyCode === HOME_KEY_CODE) {
    navigateKeyHome(
      { items, activeItemInfo },
      { navigateToIndex, ctrlMetaKey }
    );
  } else if (keyCode === END_KEY_CODE) {
    navigateKeyEnd({ items, activeItemInfo }, { navigateToIndex, ctrlMetaKey });
  } else if (keyCode === LEFT_KEY_CODE) {
    dispatch(navigateKeyLeft({ items, activeItemInfo }));
  } else if (keyCode === RIGHT_KEY_CODE) {
    dispatch(navigateKeyRight({ items, activeItemInfo }));
  } else if (key === CONTEXT_MENU_KEY) {
    await dispatch(
      showObjectContextMenu(
        { item: activeItemInfo.item, index: activeItemInfo.index },
        getContextMenuPosition(elementClientRect),
        filteredSelections,
        navigateToIndex
      )
    );
  } else if (key === ENTER_KEY) {
    await dispatch(
      editObject({ items, index: activeItemInfo.index }, navigateToIndex)
    );
  } else if (keyCode === BACKSPACE_KEY_CODE || keyCode === DELETE_KEY_CODE) {
    await dispatch(clearAddMultipleToSelection(filteredSelections));
    await dispatch(
      deleteObjects({ items, activeItemInfo }, filteredSelections)
    );
  }
};

const toggleSelection = (activeItemInfo) => {
  return async (dispatch) => {
    if (activeItemInfo?.item.source?.selectableItems) {
      if (activeItemInfo?.item.selected) {
        await dispatch(removeFromSelection(activeItemInfo.item.object.id));
      } else {
        await dispatch(
          addToSelection(
            activeItemInfo.item.source.propertyObjectType,
            activeItemInfo.item.object.id
          )
        );
      }
      await dispatch(setForcedRender({ domToModel: false }));
    }
  };
};

const getContextMenuPosition = (elementClientRect) => {
  const VERTICAL_OFFSET = 10;
  const HORIZONAL_OFFSET = 20;
  return {
    x:
      elementClientRect.left +
      elementClientRect.width +
      -HORIZONAL_OFFSET +
      window.scrollX,
    y:
      elementClientRect.top +
      elementClientRect.height +
      -VERTICAL_OFFSET +
      window.scrollY
  };
};

export function deleteObjects({ items, activeItemInfo }, filteredSelections) {
  return async (dispatch) => {
    if (_.size(filteredSelections) > 0) {
      await dispatch(toggleConfirmDelete());
    } else if (!!activeItemInfo) {
      const item = items[activeItemInfo.index];
      if (item.source?.propertyObjectType === ObjectType.RELATION) {
        await dispatch(toggleConfirmDeleteRelation());
      } else if (item.source?.propertyObjectType === ObjectType.LINE) {
        await dispatch(toggleConfirmDeleteLine());
      } else if (
        item.source?.propertyObjectType === ObjectType.TABLE ||
        item.source?.propertyObjectType === ObjectType.OTHER_OBJECT ||
        item.source?.propertyObjectType === ObjectType.RELATION
      ) {
        await dispatch(
          addToSelection(item.source?.propertyObjectType, item.object.id)
        );
        getCurrentHistoryTransaction().addResizeRequest({
          domToModel: false,
          operation: "deleteObjects"
        });

        await dispatch(toggleConfirmDelete());
      }
    }
  };
}
