import {
  FETCH_APP_LATEST_VERSION,
  FETCH_PROFILE_APP_INFO,
  FETCH_PROFILE_FEATURES,
  FETCH_PROFILE_LICENSE
} from "../actions/profile";
import { getAppName, getAppVersion } from "common";

import { getAvailableFeatures } from "../app_config";

const INITIAL_STATE = {
  appInfo: {
    appName: getAppName(process.env.REACT_APP_PRODUCT),
    appVersion: getAppVersion(process.env.REACT_APP_PRODUCT),
    trialDays: 0,
    remainingDays: -1,
    installDate: "",
    diffDays: 0
  },
  licInfo: {
    key: "",
    created: "",
    licType: ""
  },
  availableFeatures: getAvailableFeatures()
};

export default function (state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case FETCH_PROFILE_LICENSE:
      return {
        ...state,
        licInfo: action.payload
      };

    case FETCH_APP_LATEST_VERSION:
      return {
        ...state,
        appLatestVersion: action.payload
      };

    case FETCH_PROFILE_APP_INFO:
      return {
        ...state,
        appInfo: action.payload
      };

    case FETCH_PROFILE_FEATURES:
      return {
        ...state,
        availableFeatures: action.payload
      };

    default:
      return state;
  }
}
