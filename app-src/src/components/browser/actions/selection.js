import {
  addToSelection,
  clearAddToSelection,
  clearSelection,
  removeFromSelection
} from "../../../actions/selections";

import { setForcedRender } from "../../../actions/ui";

export const processSelection = (item, ctrlMetaKey) => {
  return async (dispatch) => {
    if (!ctrlMetaKey) {
      if (item.source) {
        await dispatch(
          clearAddToSelection(item.source.propertyObjectType, item.object.id)
        );
      } else {
        await dispatch(clearSelection(true));
      }
      await dispatch(setForcedRender({ domToModel: false }));
    }
  };
};

export const toggleSelection = (checked, item) => {
  return async (dispatch) => {
    if (checked) {
      await dispatch(
        addToSelection(item.source.propertyObjectType, item.object.id)
      );
    } else {
      await dispatch(removeFromSelection(item.object.id));
    }
    await dispatch(setForcedRender({ domToModel: false }));
  };
};
