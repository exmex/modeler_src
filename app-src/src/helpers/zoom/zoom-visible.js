import _ from "lodash";
import { zoomVisibleERD } from "./zoom_visible_erd";
import { zoomVisibleTreeDiagram } from "./zoom_visible_tree_diagram";

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 1.6;
export const ZOOM_STEP = 0.1;

export const calculateZoomFactor = (zoomFactorPrecise) => {
  const result = [16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].find(
    (i) => i <= zoomFactorPrecise * 10
  );
  return result ? result / 10 : 0.1;
};

const isERD = (state) => {
  return state.diagrams[state.model.activeDiagram]?.type === "erd";
};

export const zoomFit = ({ maxZoom, items }) => {
  return (dispatch, getState) => {
    if (isERD(getState())) {
      dispatch(zoomVisibleERD({ maxZoom, items }));
    } else {
      dispatch(zoomVisibleTreeDiagram({ maxZoom }));
    }
  };
};
