import { SET_DIAGRAM_ZOOM } from "../../actions/diagrams";
import _ from "lodash";
import { calculateZoomFactor } from "./zoom-visible";
import { calculateZoomFactorPrecise } from "./zoom_visible_erd";
import { setZoomScroll } from "../../actions/ui";

export const zoomVisibleTreeDiagram = ({ maxZoom }) => {
  return (dispatch, getState) => {
    const mainArea = document.getElementById("main-area");
    if (!mainArea) {
      return;
    }

    const widthObjects = [
      // @ts-ignore
      ...document.getElementsByClassName("tree__flex"),
      // @ts-ignore
      ...document.getElementsByClassName("tree__item__root__wrapper")
    ];

    const maxWidth = _.reduce(
      widthObjects,
      (r, element) => {
        return Math.max(r, element.offsetLeft + element.clientWidth);
      },
      0
    );

    const heightObjects = [
      // @ts-ignore
      ...document.getElementsByClassName("tree__item__root")
    ];
    const maxHeight = _.reduce(
      heightObjects,
      (r, element) => {
        return Math.max(r, element.offsetTop + element.clientHeight);
      },
      20
    );

    const objectsArea = {
      x1: 0,
      y1: 0,
      x2: maxWidth,
      y2: maxHeight
    };

    const zoomFactorPrecise = calculateZoomFactorPrecise(
      objectsArea,
      {
        x: mainArea.clientWidth,
        y: mainArea.clientHeight
      },
      maxZoom
    );
    const zoom = calculateZoomFactor(zoomFactorPrecise);
    const changeScroll = {
      x: Math.floor(objectsArea.x1 * zoom),
      y: Math.floor(objectsArea.y1 * zoom)
    };

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
