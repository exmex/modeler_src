import { MAX_ZOOM, MIN_ZOOM, ZOOM_STEP } from "./zoom-visible";

import { SET_DIAGRAM_ZOOM } from "../../actions/diagrams";
import { setZoomScroll } from "../../actions/ui";

export const zoomToPoint = ({ cursor, scroll, currentZoom, newZoom }) => {
  const changeScroll = {
    x: Math.round(
      scroll.x * (newZoom / currentZoom) +
        (cursor.x * newZoom) / currentZoom -
        cursor.x
    ),
    y: Math.round(
      scroll.y * (newZoom / currentZoom) +
        (cursor.y * newZoom) / currentZoom -
        cursor.y
    )
  };

  return { zoom: newZoom, changeScroll };
};

export const calcNewZoomFactor = (isZoomOut, currentZoom) => {
  const newZoom = isZoomOut
    ? Math.max(currentZoom - ZOOM_STEP, MIN_ZOOM)
    : Math.min(currentZoom + ZOOM_STEP, MAX_ZOOM);
  return +newZoom.toFixed(1);
};

export const wheelZoom = ({ delta, cursor, scroll }) => {
  return (dispatch, getState) => {
    const currentZoom = getState().ui.zoom;

    const newZoom = calcNewZoomFactor(delta.y > 0, currentZoom);
    if (newZoom === currentZoom) {
      return;
    }
    const { zoom, changeScroll } = zoomToPoint({
      cursor,
      scroll,
      currentZoom,
      newZoom
    });

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
