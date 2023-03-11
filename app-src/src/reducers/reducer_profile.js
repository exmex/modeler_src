import {
  ADD_APP_TEST_PROPERTY,
  FETCH_APP_LATEST_VERSION,
  FETCH_PROFILE_FEATURES,
  FETCH_PROFILE_LICENSE,
  FETCH_PROFILE_TRIAL_INFO
} from "../actions/profile";
import { getAppName, getAppVersion } from "common";

import { getAvailableFeatures } from "../app_config";

const INITIAL_STATE = {
  appInfo: {
    appName: getAppName(process.env.REACT_APP_PRODUCT),
    appVersion: getAppVersion(process.env.REACT_APP_PRODUCT),
    lifespan: "2023-09-30T00:00:00"
  },
  trial: {
    remainingTrialDays: -1
  },
  licInfo: {
    key: "",
    created: "",
    licType: ""
  },
  test: {},
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

    case FETCH_PROFILE_FEATURES:
      return {
        ...state,
        availableFeatures: action.payload
      };

    case FETCH_PROFILE_TRIAL_INFO: {
      return {
        ...state,
        trial: action.payload
      };
    }

    case ADD_APP_TEST_PROPERTY: {
      return {
        ...state,
        test: { ...state.test, [action.payload.name]: action.payload.value }
      };
    }

    default:
      return state;
  }
}
