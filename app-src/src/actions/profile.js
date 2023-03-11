import {
  Features,
  isBasicLuna,
  isBasicMoon,
  isFreeware,
  isGalaxy,
  isLuna,
  isMeteor,
  isMoon,
  isPerseid
} from "../helpers/features/features";
import { TYPE, addNotificationSimple } from "./notifications";

import _ from "lodash";
import axios from "axios";
import moment from "moment";

export const FETCH_PROFILE_LICENSE = "fetch_profile_license";
export const FETCH_PROFILE_FEATURES = "fetch_profile_features";
export const FETCH_APP_LATEST_VERSION = "fetch_app_latest_version";
export const FETCH_PROFILE_TRIAL_INFO = "fetch_profile_trial_info";
export const ADD_APP_TEST_PROPERTY = "add_app_test_property";

function getAppLatestVersionUrl(appName, appVersion) {
  return `https://www.datensen.com/api/${appName}/v/${appVersion}`;
}

function reportNewVersion() {
  return (dispatch, getState) => {
    const state = getState();
    const data = state.profile.appLatestVersion?.data;
    if (data?.[2] === 1) {
      dispatch(
        addNotificationSimple(
          `${data[0]}. Download version ${data[1]} from`,
          TYPE.INFO,
          false,
          "https://www.datensen.com",
          "https://www.datensen.com",
          true
        )
      );
    }
  };
}

export function addAppTestProperty({ name, value }) {
  return async (dispatch, getState) => {
    dispatch({
      type: ADD_APP_TEST_PROPERTY,
      payload: { name, value }
    });
  };
}

export function fetchProfileTrialInfo(appLifespan) {
  return async (dispatch, getState) => {
    const today = new Date();
    const installed = moment.unix(appLifespan).toDate();
    const diff = (+today - +installed) / 86400000;
    const remainingTrialDays = 14 - Math.floor(diff);
    dispatch({
      type: FETCH_PROFILE_TRIAL_INFO,
      payload: { remainingTrialDays }
    });
  };
}

export function fetchAppLatestVersion() {
  return async (dispatch, getState) => {
    const state = getState();

    const appName = state.profile.appInfo.appName;
    const appVersion = state.profile.appInfo.appVersion;

    const url = getAppLatestVersionUrl(appName, appVersion);
    try {
      const { data } = await axios.get(url);
      await dispatch({
        type: FETCH_APP_LATEST_VERSION,
        payload: data
      });
      await dispatch(reportNewVersion());
    } catch (err) {
      //console.log(err);
    }
  };
}

function replaceProductName(state, licData) {
  const MOON_PRODUCT_NAME = "Moon";
  const GALAXY_PRODUCT_NAME = "Galaxy Modeler";
  if (
    !isMoon(state.profile) &&
    licData.purchase.product_name.includes(MOON_PRODUCT_NAME)
  ) {
    const currentProductName = _.upperFirst(process.env.REACT_APP_PRODUCT);
    const product_name = isGalaxy(state.profile)
      ? GALAXY_PRODUCT_NAME
      : licData.purchase.product_name.replace(
          MOON_PRODUCT_NAME,
          currentProductName
        );

    return {
      ...licData,
      purchase: {
        ...licData.purchase,
        product_name
      }
    };
  } else {
    return licData;
  }
}

export function fetchProfileLicense(licData) {
  return (dispatch, getState) => {
    const modifiedLicData = replaceProductName(getState(), licData);
    dispatch({
      type: FETCH_PROFILE_LICENSE,
      payload: modifiedLicData
    });
  };
}

function getFeaturesForProfileMoon(profile) {
  if (isFreeware(profile)) {
    return [];
  } else if (isBasicMoon(profile)) {
    return [Features.CONNECTIONS, Features.IMPORT_FROM_FILE];
  }
  return [
    Features.SSH,
    Features.TLS,
    Features.MULTIDIAGRAMS,
    Features.REPORTS,
    Features.CONNECTIONS,
    Features.IMPORT_FROM_FILE,
    Features.MULTIPLE_INSTANCES,
    Features.CONVERT
  ];
}

function getFeaturesForProfileGalaxy(profile) {
  if (isFreeware(profile)) {
    return [];
  } else {
    return [
      Features.MULTIDIAGRAMS,
      Features.REPORTS,
      Features.IMPORT_FROM_FILE,
      Features.IMPORT_FROM_URL,
      Features.MULTIPLE_INSTANCES
    ];
  }
}

function getFeaturesForProfileLuna(profile) {
  if (isFreeware(profile)) {
    return [];
  } else if (isBasicLuna(profile)) {
    return [Features.CONNECTIONS];
  } else {
    return [
      Features.UPDATE,
      Features.SSH,
      Features.TLS,
      Features.MULTIDIAGRAMS,
      Features.REPORTS,
      Features.DIFF_HTML_REPORTS,
      Features.CONNECTIONS,
      Features.MULTIPLE_INSTANCES
    ];
  }
}

export function getFeaturesForProfile(profile) {
  if (isPerseid(profile)) {
    return [
      Features.IMPORT_FROM_FILE,
      Features.REPORTS,
      Features.MULTIPLE_INSTANCES
    ];
  } else if (isMeteor(profile)) {
    if (isFreeware(profile)) {
      return [Features.FREEWARE];
    }
    return [Features.MULTIPLE_INSTANCES];
  } else if (isMoon(profile)) {
    return getFeaturesForProfileMoon(profile);
  } else if (isGalaxy(profile)) {
    return getFeaturesForProfileGalaxy(profile);
  } else if (isLuna(profile)) {
    return getFeaturesForProfileLuna(profile);
  }
  return [];
}

export function fetchProfileFeatures(features) {
  return {
    type: FETCH_PROFILE_FEATURES,
    payload: features
  };
}
