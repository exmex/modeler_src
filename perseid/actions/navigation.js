import { navigateToItemUrl } from "../components/url_navigation";

export function navigateTable(historyContext, id) {
  return async (dispatch, getState) => {
    const state = getState();
    const table = state.tables[id];
    if (table) {
      navigateToItemUrl(
        historyContext.state.url,
        historyContext.history,
        historyContext.state.modelId,
        historyContext.state.diagramId,
        table.id,
        table.embeddable
      );
    }
  };
}
