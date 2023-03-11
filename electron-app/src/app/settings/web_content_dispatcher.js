class WebContentListener {
  receive(type, event, data) {}
}

class WebContentDispatcher {
  constructor(ipcMain, mainWindow) {
    this.ipcMain = ipcMain;
    this.mainWindow = mainWindow;

    this.mainWindow.on("close", () => {
      this.mainWindow = undefined;
    });
  }

  addReceiveListener(type, listener) {
    this.ipcMain.on(
      type,
      async (event, data) => await listener.receive(type, event, data)
    );
  }

  send(type, message) {
    // console.dir(
    //   { WebContentDispatcher_send: { type, message } },
    //   { depth: 10 }
    // );
    this.mainWindow?.webContents?.send(type, message);
  }
}

module.exports = {
  WebContentDispatcher,
  WebContentListener
};
