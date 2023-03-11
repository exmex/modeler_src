import { DISCLOSURE, buildInstancePathId } from "../tree/definitions";

import { changeBrowserDisclosure } from "../../../actions/ui";

export const getCurrentDisclosure = (
  browserDisclosure,
  group,
  instancePathId
) => {
  const groupDefaultOrDefaultDisclosure =
    group.defaultDisclosure === undefined
      ? DISCLOSURE.OPEN
      : group.defaultDisclosure;
  return browserDisclosure?.[instancePathId] === undefined
    ? groupDefaultOrDefaultDisclosure
    : browserDisclosure?.[instancePathId];
};

export const toggleDisclosure = (browserDisclosure, item) => {
  return (dispatch) => {
    const instancePathId = buildInstancePathId(item.instancePath);
    const currentDisclosure = getCurrentDisclosure(
      browserDisclosure,
      item.groupSource,
      instancePathId
    );
    dispatch(changeBrowserDisclosure(instancePathId, !currentDisclosure));
  };
};
