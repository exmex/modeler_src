import {
  clearAddMultipleToSelection,
  clearSelection
} from "../../actions/selections";
import {
  navigateByObjectType,
  navigateToDiagramUrl
} from "../../components/url_navigation";

import { ObjectType } from "../../enums/enums";
import _ from "lodash";
import { setForcedRender } from "../../actions/ui";

const leftTop = (diagramItem) => {
  return { x: diagramItem.x, y: diagramItem.y };
};

const leftBottom = (diagramItem) => {
  return { x: diagramItem.x, y: diagramItem.y + diagramItem.gHeight };
};

const rightTop = (diagramItem) => {
  return { x: diagramItem.x + diagramItem.gWidth, y: diagramItem.y };
};

const rightBottom = (diagramItem) => {
  return {
    x: diagramItem.x + diagramItem.gWidth,
    y: diagramItem.y + diagramItem.gHeight
  };
};

const isPointInSelectionArea = (point, box) => {
  return (
    point.x > box.left &&
    point.x < box.left + box.width &&
    point.y > box.top &&
    point.y < box.top + box.height
  );
};

const leftTopInSelectionArea = (diagramItem, box) => {
  return isPointInSelectionArea(leftTop(diagramItem), box);
};

const leftBottomInSelectionArea = (diagramItem, box) => {
  return isPointInSelectionArea(leftBottom(diagramItem), box);
};

const rightTopInSelectionArea = (diagramItem, box) => {
  return isPointInSelectionArea(rightTop(diagramItem), box);
};

const rightBottomInSelectionArea = (diagramItem, box) => {
  return isPointInSelectionArea(rightBottom(diagramItem), box);
};

export const isObjectInSelectionArea = (diagramItem, visible, box) => {
  if (!diagramItem || !visible) {
    return false;
  }
  if (box.reverse) {
    return (
      leftTopInSelectionArea(diagramItem, box) ||
      leftBottomInSelectionArea(diagramItem, box) ||
      rightTopInSelectionArea(diagramItem, box) ||
      rightBottomInSelectionArea(diagramItem, box)
    );
  } else {
    return (
      leftTopInSelectionArea(diagramItem, box) &&
      leftBottomInSelectionArea(diagramItem, box) &&
      rightTopInSelectionArea(diagramItem, box) &&
      rightBottomInSelectionArea(diagramItem, box)
    );
  }
};

const collectionByObjectType = (model, objectType) => {
  switch (objectType) {
    case ObjectType.NOTE:
      return model.notes;
    case ObjectType.OTHER_OBJECT:
      return model.otherObjects;
    case ObjectType.TABLE:
      return model.tables;
    default:
      return undefined;
  }
};

const getSelectionInSelectionArea = (model, objectType, box) => {
  return _.filter(collectionByObjectType(model, objectType), (object) => {
    const diagram = model.diagrams[model.model.activeDiagram];
    const diagramItem = diagram?.diagramItems[object.id];
    const isDiagramItemVisible = diagram.main ? object.visible : true;
    return isObjectInSelectionArea(diagramItem, isDiagramItemVisible, box);
  })
    .map((object) => ({
      objectType,
      objectId: object.id,
      embeddable: object.embeddable
    }))
    .reduce((r, i) => {
      r[i.objectId] = i;
      return r;
    }, {});
};

const getSelectableTypes = () => {
  return [ObjectType.TABLE, ObjectType.NOTE, ObjectType.OTHER_OBJECT];
};

export const selectObjectsInSelectionBox = (
  historyContext,
  box,
  isActiveLink
) => {
  return async (dispatch, getState) => {
    const model = getState();
    const selectableTypes = getSelectableTypes();

    const objectsToSelect = selectableTypes
      .map((selectableType) =>
        getSelectionInSelectionArea(model, selectableType, box)
      )
      .reduce((r, i) => ({ ...r, ...i }), {});

    if (_.size(objectsToSelect) > 0) {
      await dispatch(selectMultipleObjects(objectsToSelect, historyContext));
    } else {
      await dispatch(unselectObjects(isActiveLink, historyContext));
    }
  };
};

const unselectObjects = (isLink, historyContext) => {
  return async (dispatch) => {
    await dispatch(clearSelection(isLink));

    navigateToDiagramUrl(
      historyContext.state.url,
      historyContext.history,
      historyContext.state.modelId,
      historyContext.state.diagramId
    );

    await dispatch(setForcedRender({ domToModel: false }));
  };
};

const selectMultipleObjects = (objectsToSelect, historyContext) => {
  return async (dispatch) => {
    await dispatch(clearAddMultipleToSelection(objectsToSelect));

    const objectToSelect = Object.keys(objectsToSelect)
      .map((key) => objectsToSelect[key])
      .find(() => true);

    if (objectToSelect) {
      navigateByObjectType(historyContext, objectToSelect.objectType, {
        id: objectToSelect.objectId,
        embeddable: objectToSelect.embeddable
      });
    }
    await dispatch(setForcedRender({ domToModel: false }));
  };
};
