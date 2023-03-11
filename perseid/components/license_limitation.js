import { DEV_DEBUG, isDebug } from "../web_env";

import _ from "lodash";

export const checkLimit = (profile, tables, beforeAdd) => {
  return (
    !isDebug([DEV_DEBUG]) &&
    profile.licInfo.key === "" &&
    profile.appInfo.remainingDays < 0 &&
    _.size(tables) >= (beforeAdd === true ? 10 : 11)
  );
};
