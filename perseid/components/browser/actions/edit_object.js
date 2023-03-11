import {
  toggleLineModal,
  toggleModelModal,
  toggleNoteModal,
  toggleOtherObjectModal,
  toggleRelationModal,
  toggleTableModal
} from "../../../actions/ui";

import { ObjectType } from "../../../enums/enums";
import { toggleDisclosure } from "./disclosure";

export const editObject = ({ items, index }, navigateToIndex) => {
  return async (dispatch, getState) => {
    const item = items[index];
    if (item.source) {
      navigateToIndex(index, false);
      await dispatch(openModal(item.source.propertyObjectType));
    } else if (item.groupSource) {
      await dispatch(toggleDisclosure(getState().ui.browserDisclosure, item));
    }
  };
};

const openModal = (objectType) => {
  return (dispatch) => {
    switch (objectType) {
      case ObjectType.MODEL: {
        dispatch(toggleModelModal());
        return;
      }
      case ObjectType.TABLE: {
        dispatch(toggleTableModal());
        return;
      }
      case ObjectType.NOTE: {
        dispatch(toggleNoteModal());
        return;
      }
      case ObjectType.OTHER_OBJECT: {
        dispatch(toggleOtherObjectModal());
        return;
      }
      case ObjectType.RELATION: {
        dispatch(toggleRelationModal());
        return;
      }
      case ObjectType.LINE: {
        dispatch(toggleLineModal());
        return;
      }
    }
  };
};
