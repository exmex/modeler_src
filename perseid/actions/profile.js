import { TYPE, addNotificationSimple } from "./notifications";

import axios from "axios";

export const FETCH_PROFILE_LICENSE = "fetch_profile_license";
export const FETCH_PROFILE_FEATURES = "fetch_profile_features";
export const FETCH_PROFILE_APP_INFO = "fetch_profile_app_info";
export const FETCH_APP_LATEST_VERSION = "fetch_app_latest_version";

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
        payload: data,
      });
      await dispatch(reportNewVersion());
    } catch (err) {
      //console.log(err);
    }
  };
}

export function fetchProfileLicense(licData) {
  return {
    type: FETCH_PROFILE_LICENSE,
    payload: licData,
  };
}

// {mode: trial|commercial|beta}
export function fetchProfileFeatures(features) {
  return {
    type: FETCH_PROFILE_FEATURES,
    payload: features,
  };
}

export function fetchProfileAppInfo(appInfo) {
  return {
    type: FETCH_PROFILE_APP_INFO,
    payload: appInfo,
  };
}
