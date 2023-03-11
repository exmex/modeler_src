import _ from "lodash";

const INSTANCE_PATH_SEPARATOR = "::";
const GROUP_PATH_SEPARATOR = ".";

export const VISIBILITY = {
  HIDE: false,
  SHOW: true
};

export const DISCLOSURE = {
  CLOSE: false,
  OPEN: true
};

export const ORDER = {
  DEFAULT: "default"
};

export const buildGroupPathId = (groupPath) => {
  return _.map(groupPath, (group) => group.propertyName).join(
    GROUP_PATH_SEPARATOR
  );
};

export const buildInstancePathId = (instancePath) =>
  _.map(
    instancePath,
    (instance) =>
      instance.object?.id ||
      instance.group?.propertyName ||
      instance.groupSource.propertyName
  ).join(INSTANCE_PATH_SEPARATOR);

export const urlToInstancePathId = () => {};
