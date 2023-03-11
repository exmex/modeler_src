import { SET_DIAGRAM_ZOOM } from "../../actions/diagrams";
import _ from "lodash";
import { calculateZoomFactor } from "./zoom-visible";

const { setZoomScroll } = require("../../actions/ui");
const {
  getActiveDiagramTables,
  getActiveDiagramOtherObjects,
  getActiveDiagramNotes
} = require("../../selectors/selector_diagram");

const INITIAL_ZOOM = {
  scroll: { x: 0, y: 0 },
  zoom: 1
};

export const zoomVisibleERD = ({ maxZoom, items }) => {
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
    dispatch({
      type: SET_DIAGRAM_ZOOM,
      payload: {
        id: getState().model.activeDiagram,
        zoom
      }
    });
  };
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

export const calculateZoomFactorPrecise = (
  objectsArea,
  windowSize,
  maxZoom
) => {
  if (objectsArea.count === 0) {
    return 1;
  }
  const zoomFactorX = windowSize.x / (objectsArea.x2 - objectsArea.x1);
  const zoomFactorY = windowSize.y / (objectsArea.y2 - objectsArea.y1);
  return Math.min(Math.min(zoomFactorX, zoomFactorY), maxZoom);
};
