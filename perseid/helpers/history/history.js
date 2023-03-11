import { addToHistory, getModelState } from "../../actions/undoredo";

import { DeltaCalculator } from "./delta_calculator";
import _ from "lodash";
import { setForcedRender } from "../../actions/ui";

export class HistoryState {
  constructor(
    url,
    modelId,
    diagramId,
    tableId,
    noteId,
    otherObjectId,
    columnId
  ) {
    this.url = url;
    this.modelId = modelId;
    this.diagramId = diagramId;
    this.tableId = tableId;
    this.noteId = noteId;
    this.otherObjectId = otherObjectId;
    this.columnId = columnId;
  }
}

export const getHistoryState = (match) => {
  return new HistoryState(
    match.url,
    match.params.mid,
    match.params.did,
    match.params.id,
    match.params.nid,
    match.params.oid,
    match.params.cid
  );
};

export class HistoryContext {
  constructor(history, state) {
    this.history = history;
    this.state = state;
  }
}

export class HistoryTransaction {
  constructor(historyContext, id, startState) {
    this.historyContext = historyContext;
    this.id = id;
    this.calculateDelta = this.calculateDelta.bind(this);
    this.startState = startState;
    this.resizeRequests = [];
    this.position = {};
  }

  combineRenderRequest() {
    return _.reduce(
      this.resizeRequests,
      (combinedRenderRequests, renderRequest) => {
        if (renderRequest.domToModel === true) {
          combinedRenderRequests = {
            ...combinedRenderRequests,
            domToModel: true
          };
        }
        if (renderRequest.byUser === true) {
          combinedRenderRequests = { ...combinedRenderRequests, byUser: true };
        }
        if (renderRequest.autoExpand === true) {
          combinedRenderRequests = {
            ...combinedRenderRequests,
            autoExpand: true
          };
        }
        if (renderRequest.objects) {
          combinedRenderRequests = {
            ...combinedRenderRequests,
            objects: combinedRenderRequests.objects
              ? [...combinedRenderRequests.objects, ...renderRequest.objects]
              : renderRequest.objects
          };
        }
        return combinedRenderRequests;
      },
      {}
    );
  }

  finish(skipHistory) {
    return async (dispatch, getState) => {
      const combinedRenderRequests = this.combineRenderRequest();
      await dispatch(setForcedRender(combinedRenderRequests));

      if (skipHistory) {
        return;
      }

      const finishState = getModelState(getState());
      const difference = new DeltaCalculator(
        this.startState,
        finishState
      ).calculate();

      if (_.size(difference) === 0) {
        return;
      }

      await dispatch(addToHistory(this, difference));
    };
  }

  init() {
    return async (_dispatch, getState) => {
      const state = getState();
      this.position = {
        activeDiagram: state.model.activeDiagram,
        url: this.historyContext.state.url,
        zoom: state?.diagrams?.[state.model.activeDiagram]?.zoom || 1
      };
      this.startState = getModelState(getState());
    };
  }

  calculateDelta(finishState, startState) {
    return new DeltaCalculator(startState, finishState).calculate();
  }

  addResizeRequest(payload) {
    this.resizeRequests.push(payload);
  }
}

export const getHistoryContext = (history, match) => {
  return new HistoryContext(history, getHistoryState(match));
};
