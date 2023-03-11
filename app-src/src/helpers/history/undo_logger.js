import { DEV_DEBUG, isDebug } from "../../web_env";

import { UndoRedoDef } from "./undo_redo_transaction_defs";
import _ from "lodash";

export const registerUndoId = (platform, id) => {
  if (isDebug([DEV_DEBUG])) {
    const processedUndo = loadProcessedUndo(platform);

    processedUndo[id] = (processedUndo?.[id] || 0) + 1;

    store(platform, processedUndo);
    report(platform, processedUndo);
  }
};

export const clearProcessedUndo = (platform) => {
  const processedUndo = {};
  store(platform, processedUndo);
  report(platform, processedUndo);
};

const getNotUsedUndoIds = (processedUndo) => {
  return _.without(_.keys(UndoRedoDef), ..._.keys(processedUndo));
};

const report = (platform, processedUndo) => {
  const notUsedUndoIds = getNotUsedUndoIds(processedUndo);
  console.log({
    platform,
    processed: processedUndo,
    remaining: notUsedUndoIds,
    remainingCount: notUsedUndoIds.length
  });
};

const getStorageKey = (platform) => {
  const PROCESS_UNDO_PREFIX = "processedUndo";
  const PROCESS_UNDO_SEPARATOR = "::";
  return `${PROCESS_UNDO_PREFIX}${PROCESS_UNDO_SEPARATOR}${platform}`;
};

const store = (platform, processedUndo) => {
  localStorage.setItem(getStorageKey(platform), JSON.stringify(processedUndo));
};

const loadProcessedUndo = (platform) => {
  try {
    const result = JSON.parse(localStorage.getItem(getStorageKey(platform)));
    return !result ? {} : result;
  } catch {
    return {};
  }
};
