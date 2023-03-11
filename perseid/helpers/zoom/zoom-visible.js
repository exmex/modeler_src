import {
  getActiveDiagramItems,
  getActiveDiagramNotes,
  getActiveDiagramOtherObjects,
  getActiveDiagramTables
} from "../../selectors/selector_diagram";

import _ from "lodash";
import { setZoomScroll } from "../../actions/ui";

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 1.6;
export const ZOOM_STEP = 0.1;

const INITIAL_ZOOM = {
  scroll: { x: 0, y: 0 },
  zoom: 1
};

export const zoomVisible = ({ items }, { x, y }, maxZoom) => {
  return calculateZoomVisible(
    items,
    {
      x,
      y
    },
    INITIAL_ZOOM,
    maxZoom
  );
};
const calculateZoomVisible = (items, windowSize, defaultZoom, maxZoom) => {
  const filteredItems = _.values(items);

  if (filteredItems && filteredItems.length === 0) {
    return defaultZoom;
  }

  const objectsArea = calculateAllObjectsArea(filteredItems);
  const zoomFactorPrecise = calculateZoomFactorPrecise(
    objectsArea,
    windowSize,
    maxZoom
  );
  const zoom = calculateZoomFactor(zoomFactorPrecise);
  const changeScroll = {
    x: Math.floor(objectsArea.x1 * zoom),
    y: Math.floor(objectsArea.y1 * zoom)
  };

  return {
    changeScroll,
    zoom
  };
};

const calculateZoomFactorPrecise = (objectsArea, windowSize, maxZoom) => {
  if (objectsArea.count === 0) {
    return 1;
  }
  const zoomFactorX = windowSize.x / (objectsArea.x2 - objectsArea.x1);
  const zoomFactorY = windowSize.y / (objectsArea.y2 - objectsArea.y1);
  return Math.min(Math.min(zoomFactorX, zoomFactorY), maxZoom);
};

const calculateZoomFactor = (zoomFactorPrecise) => {
  const result = [16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].find(
    (i) => i <= zoomFactorPrecise * 10
  );
  return result ? result / 10 : 0.1;
};

const calculateAllObjectsArea = (items) => {
  let result = {
    x1: Number.MAX_SAFE_INTEGER,
    y1: Number.MAX_SAFE_INTEGER,
    x2: 0,
    y2: 0,
    count: 0
  };
  result = calculateObjectsArea(items, result);

  return {
    x1: Math.max(result.x1 > result.x2 ? 0 : result.x1 - 20, 0),
    y1: Math.max(result.y1 > result.y2 ? 0 : result.y1 - 20, 0),
    x2: result.x2 + 20,
    y2: result.y2 + 20,
    count: result.count
  };
};

const calculateObjectsArea = (objects, initial) => {
  if (!objects) {
    return initial;
  }

  return Object.keys(objects)
    .map((key) => objects[key])
    .reduce((r, i) => {
      return {
        x1: r.x1 > i.x ? i.x : r.x1,
        y1: r.y1 > i.y ? i.y : r.y1,
        x2: r.x2 < i.x + i.gWidth ? i.x + i.gWidth : r.x2,
        y2: r.y2 < i.y + i.gHeight ? i.y + i.gHeight : r.y2,
        count: r.count + 1
      };
    }, initial);
};

export const zoomFit = ({ maxZoom, items }) => {
  return (dispatch, getState) => {
    const mainArea = document.getElementById("main-area");
    if (!mainArea) {
      return;
    }
    let zoomItems = items;
    if (!items) {
      const tables = getActiveDiagramTables(getState());
      const otherObjects = getActiveDiagramOtherObjects(getState());
      const notes = getActiveDiagramNotes(getState());

      zoomItems = {
        items: {
          ...tables,
          ...otherObjects,
          ...notes
        }
      };
    }

    const { zoom, changeScroll } = zoomVisible(
      zoomItems,
      {
        x: mainArea.clientWidth,
        y: mainArea.clientHeight
      },
      maxZoom ? maxZoom : 1.6
    );

    dispatch(setZoomScroll({ zoom, changeScroll }));
  };
};

export const panMostLeftObject = () => {
  return (dispatch, getState) => {
    const state = getState();
    const items = _.values(getActiveDiagramItems(state));
    const mostLeftObj = _.reduce(
      items,
      (r, i) => {
        return !r || r?.x > i.x ? i : r;
      },
      undefined
    );
    if (mostLeftObj) {
      dispatch(
        zoomFit({
          maxZoom: state.ui.zoom,
          items: { items: { [mostLeftObj.id]: mostLeftObj } }
        })
      );
    }
  };
};
