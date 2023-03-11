import { FETCH_SETTINGS, UPDATE_SETTINGS_PROPERTY } from "../actions/settings";

import { BackupModelTime } from "../enums/enums";

const INITIAL_STATE = {
  theme: "im-dark",
  undoSteps: 60,
  showToolbarCaptions: true,
  eula_im: false,
  showTips: true,
  showAllObjectsInList: false,
  proxy: {
    enabled: false,
    host: "",
    port: "",
    username: "",
    password: ""
  },
  backupModelTime: BackupModelTime.FIVE_SECONDS
};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case UPDATE_SETTINGS_PROPERTY:
      return {
        ...state,
        [action.payload.pName]: action.payload.newValue
      };
    case FETCH_SETTINGS:
      return { ...state, ...action.payload.content };
    default:
      return state;
  }
}
