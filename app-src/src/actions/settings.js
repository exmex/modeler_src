export const UPDATE_SETTINGS_PROPERTY = "update_settings_property";
export const FETCH_SETTINGS = "fetch_settings";

const ipcRenderer = window?.ipcRenderer;

export function updateSettingsProperty(newValue, pName) {
  return (dispatch, getState) => {
    dispatch({
      type: UPDATE_SETTINGS_PROPERTY,
      payload: { newValue, pName }
    });
  };
}

export function fetchSettings(settings) {
  return (dispatch, getState) => {
    dispatch({
      type: FETCH_SETTINGS,
      payload: settings
    });
  };
}

let backupTimer;
const SETTINGS_SAVE_EVENT = "settings:save";
const ENCRYPTED_SETTINGS_SAVE_EVENT = "encryptedSettings:save";

export function saveSettings(settings) {
  ipcRenderer?.send(SETTINGS_SAVE_EVENT, settings);
  ipcRenderer?.send(ENCRYPTED_SETTINGS_SAVE_EVENT, settings);
}

export function storeSettings() {
  return async (dispatch, getState) => {
    ipcRenderer?.send("settings:save", getState().settings);
    ipcRenderer?.send("encryptedSettings:save", getState().settings);
  };
}
