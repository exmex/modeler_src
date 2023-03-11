import { VISIBILITY } from "./definitions";
import _ from "lodash";

export const getGroupVisibility = (
  groupPathId,
  group,
  platformBrowserSettings
) => {
  const groupDefaultOrDefaultVisibility =
    group.defaultVisibility === undefined
      ? VISIBILITY.SHOW
      : group.defaultVisibility;
  return platformBrowserSettings?.[groupPathId] === undefined
    ? groupDefaultOrDefaultVisibility
    : platformBrowserSettings?.[groupPathId];
};

export const getVisibleGroups = (
  groupPathId,
  groupSource,
  platformBrowserSettings
) => {
  return _.filter(groupSource.groups, (group) =>
    isGroupVisible(
      `${groupPathId}.${group.propertyName}`,
      group,
      platformBrowserSettings
    )
  );
};

export const isGroupVisible = (groupPathId, group, platformBrowserSettings) => {
  return (
    getGroupVisibility(groupPathId, group, platformBrowserSettings) ===
    VISIBILITY.SHOW
  );
};
