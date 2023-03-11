export const SET_LOCALIZATION = "set_localization";

export function setLocalization(modelType) {
  return {
    type: SET_LOCALIZATION,
    payload: modelType
  };
}
