import { toggleSqlModal } from "../../actions/ui";

export function subscribeSaveScriptComplete(ipcRenderer) {
  return async (dispatch, getState) => {
    ipcRenderer.once("script:saveScriptCompleted", (event, message) => {
      if (getState().ui.sqlModalIsDisplayed === true) {
        dispatch(toggleSqlModal());
      }
    });
  };
}
