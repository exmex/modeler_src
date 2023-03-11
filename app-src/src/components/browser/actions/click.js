import {
  addToSelection,
  removeFromSelection
} from "../../../actions/selections";

import { setForcedRender } from "../../../actions/ui";
import { toggleDisclosure } from "./disclosure";

const addOrRemoveFromSelection = (item) => {
  return async (dispatch) => {
    if (item.source.selectableItems) {
      if (item.selected) {
        await dispatch(removeFromSelection(item.object.id));
      } else {
        await dispatch(
          addToSelection(item.source.propertyObjectType, item.object.id)
        );
      }
      await dispatch(setForcedRender({ domToModel: false }))
    }
  };
};

export const click = ({ items, index }, { ctrlMetaKey }, navigateToIndex) => {
  return (dispatch, getState) => {
    const state = getState();
    const item = items[index];
    if (item.groupSource) {
      dispatch(toggleDisclosure(state.ui.browserDisclosure, item));
    } else {
      if (ctrlMetaKey) {
        dispatch(addOrRemoveFromSelection(items[index]));
      }
    }
    navigateToIndex(index, ctrlMetaKey);
  };
};
