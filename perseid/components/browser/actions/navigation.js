import { getCurrentDisclosure, toggleDisclosure } from "./disclosure";

import { buildInstancePathId } from "../tree/definitions";

export const navigateKeyUp = (
  { activeItemInfo },
  { navigateToIndex, ctrlMetaKey }
) => {
  if (!activeItemInfo) {
    return;
  }

  const index = activeItemInfo.index - 1;
  if (index >= 0) {
    navigateToIndex(index, ctrlMetaKey);
  }
};

export const navigateKeyDown = (
  { items, activeItemInfo },
  { navigateToIndex, ctrlMetaKey }
) => {
  if (!activeItemInfo) {
    return;
  }

  const index = activeItemInfo.index + 1;
  if (index < items.length) {
    navigateToIndex(index, ctrlMetaKey);
  }
};

export const navigateKeyPageUp = (
  { items, activeItemInfo, pageSize },
  { navigateToIndex, ctrlMetaKey }
) => {
  if (!activeItemInfo) {
    return;
  }

  const index = Math.max(activeItemInfo.index - pageSize, 0);
  if (index < items.length) {
    navigateToIndex(index, ctrlMetaKey);
  }
};

export const navigateKeyPageDown = (
  { items, activeItemInfo, pageSize },
  { navigateToIndex, ctrlMetaKey }
) => {
  if (!activeItemInfo) {
    return;
  }

  const index = Math.min(activeItemInfo.index + pageSize, items.length - 1);
  if (index >= 0) {
    navigateToIndex(index, ctrlMetaKey);
  }
};

export const navigateKeyHome = (
  { items, activeItemInfo },
  { navigateToIndex, ctrlMetaKey }
) => {
  if (!activeItemInfo) {
    return;
  }

  const index = 0;
  if (index < items.length) {
    navigateToIndex(index, ctrlMetaKey);
  }
};

export const navigateKeyEnd = (
  { items, activeItemInfo },
  { navigateToIndex, ctrlMetaKey }
) => {
  if (!activeItemInfo) {
    return;
  }

  const index = items.length - 1;
  if (index >= 0) {
    navigateToIndex(index, ctrlMetaKey);
  }
};

export const navigateKeyLeft = ({ items, activeItemInfo }) => {
  return async (dispatch, getState) => {
    const item = items[activeItemInfo.index];
    if (item.groupSource) {
      const browserDisclosure = getState().ui.browserDisclosure;
      const currentDisclosure = getCurrentDisclosure(
        browserDisclosure,
        item.groupSource,
        buildInstancePathId(item.instancePath)
      );
      if (currentDisclosure) {
        await dispatch(toggleDisclosure(getState().ui.browserDisclosure, item));
      }
    }
  };
};

export const navigateKeyRight = ({ items, activeItemInfo }) => {
  return async (dispatch, getState) => {
    const item = items[activeItemInfo.index];
    if (item.groupSource) {
      const browserDisclosure = getState().ui.browserDisclosure;
      const currentDisclosure = getCurrentDisclosure(
        browserDisclosure,
        item.groupSource,
        buildInstancePathId(item.instancePath)
      );
      if (!currentDisclosure) {
        await dispatch(toggleDisclosure(getState().ui.browserDisclosure, item));
      }
    }
  };
};
