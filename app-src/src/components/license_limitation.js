import { DEV_DEBUG, isDebug } from "../web_env";

import _ from "lodash";
import { isFreeware } from "../helpers/features/features";

export const checkLimit = (profile, tables, beforeAdd) => {
  return (
    !isDebug([DEV_DEBUG]) &&
    isFreeware(profile) &&
    _.size(tables) >= (beforeAdd === true ? 10 : 11)
  );
};
