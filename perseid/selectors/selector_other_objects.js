import _ from "lodash";
import { createSelector } from "reselect";

const allOtherObjects = state => state.otherObjects;

export const getReducedOtherObjectsList = createSelector(
  [allOtherObjects],
  allOtherObjects => {
    let otherObjectArray = {};
    _.each(allOtherObjects, otherObject => {
      otherObjectArray = {
        ...otherObjectArray,
        [otherObject.id]: {
          id: otherObject.id,
          name: otherObject.name,
          visible: otherObject.visible,
          type: otherObject.type,
          gHeight: otherObject.gHeight,
          gWidth: otherObject.gWidth,
          x: otherObject.x,
          y: otherObject.y,
          color: otherObject.color,
          background: otherObject.background
        }
      };
    });

    return {
      otherObjectArray
    };
  }
);
