import AutolayoutIntegration, {
  autolayoutExecute
} from "../helpers/autolayout/autolayout-integration";
import { IPCContext, createAutolayoutAction } from "../helpers/ipc/ipc";

import ModelBuilder from "../helpers/autolayout/model-builder";

export function autolayout(layoutType, match, history) {
  return async (dispatch, getState) => {
    const state = getState();
    const ipcContext = new IPCContext(createAutolayoutAction());
    const modelBuilder = new ModelBuilder();
    const model = modelBuilder.build({
      tables: state.tables,
      relations: state.relations,
      notes: state.notes,
      lines: state.lines,
      model: state.model,
      otherObjects: state.otherObjects,
      diagrams: state.diagrams,
      order: state.order
    });
    const zoom = state.ui.zoom;

    const ali = new AutolayoutIntegration(match, history, ipcContext, {
      model,
      modelType: state.model.type,
      zoom,
      layoutType,
      diagramId: state.model.activeDiagram
    });

    await dispatch(autolayoutExecute(ali));
  };
}
