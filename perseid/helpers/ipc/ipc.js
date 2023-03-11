import { ModelTypesForHumans } from "../../enums/enums";
import isElectron from "is-electron";

export class IPCAction {
  constructor(startEvent, finishEvent, progressEvent, caption) {
    this.startEvent = startEvent;
    this.finishEvent = finishEvent;
    this.progressEvent = progressEvent;
    this.caption = caption;
  }
}

export function openFromCommandLineAction() {
  return new IPCAction(
    "model:openFromCommandLine",
    "model:openCompleted",
    "model:openProgress",
    "Opening model from command line..."
  );
}

export function createReverseModelAction(connection) {
  return new IPCAction(
    "connectionsList:runReverse",
    "model:reverseCompleted",
    "model:reverseProgress",
    `Reversing model from ${connection.name} (${
      ModelTypesForHumans[connection.type]
    })...`
  );
}

export function createImportModelAction() {
  return new IPCAction(
    "model:import",
    "model:reverseCompleted",
    "model:reverseProgress",
    `Importing model...`
  );
}

export function createOpenAction() {
  return new IPCAction(
    "model:open",
    "model:openCompleted",
    "model:openProgress",
    "Opening model from file..."
  );
}

export function createReopenAction() {
  return new IPCAction(
    "model:reopen",
    "model:reopenCompleted",
    undefined,
    "Opening model from file..."
  );
}

export function createAutolayoutAction() {
  return new IPCAction(
    "model:runAutolayout",
    "model:autolayoutCompleted",
    undefined,
    "Computing layout..."
  );
}

export function createOpenFromUrlAction() {
  return new IPCAction(
    "model:openFromUrl",
    "model:openFromUrlCompleted",
    undefined,
    "Opening model from URL..."
  );
}

export function createImportFromUrlAction() {
  return new IPCAction(
    "model:importFromUrl",
    "model:reverseCompleted",
    undefined,
    "Importing model from URL..."
  );
}

export class IPCContext {
  constructor(action) {
    this.ipcRenderer = isElectron() ? window.ipcRenderer : undefined;
    this.action = action;
  }

  isElectron() {
    return isElectron();
  }

  send(channel, ...args) {
    this.ipcRenderer && this.ipcRenderer.send(channel, ...args);
  }

  on(channel, listener) {
    this.ipcRenderer && this.ipcRenderer.on(channel, listener);
  }

  once(channel, listener) {
    this.ipcRenderer && this.ipcRenderer.once(channel, listener);
  }

  removeListener(channel, listener) {
    this.ipcRenderer && this.ipcRenderer.removeListener(channel, listener);
  }
}
