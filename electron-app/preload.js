require("wdio-electron-service/preload");

const { contextBridge, ipcRenderer, clipboard } = require("electron");

const isDebug = () => {
  return process.env.REACT_DEBUG === `true`;
};

contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) => ipcRenderer.on(channel, func),
  once: (channel, func) => ipcRenderer.once(channel, func),
  removeListener: (channel, listener) =>
    ipcRenderer.removeListener(channel, listener),
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
});

contextBridge.exposeInMainWorld("clipboard", {
  readText: (type) => clipboard.readText(type),
  writeText: (text, type) => clipboard.writeText(text, type),
});

contextBridge.exposeInMainWorld("electron", {
  getEnv: () => "dev", //isDebug() && process.env.REACT_DEBUG_TYPE,
});
