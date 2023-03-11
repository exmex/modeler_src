import { FETCH_SETTINGS, UPDATE_SETTINGS_PROPERTY } from "../actions/settings";

const INITIAL_STATE = {
  theme: "im-dark",
  undoSteps: 60,
  showToolbarCaptions: true,
  eula: false,
  showTips: true,
  showAllObjectsInList: false
};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case UPDATE_SETTINGS_PROPERTY:
      return {
        ...state,
        [action.payload.pName]: action.payload.newValue
      };
    case FETCH_SETTINGS:
      return action.payload;
    default:
      return state;
  }
}
