const NEW_MESSAGE = "notification:newMessage";
const ERROR = "error";

class Dispatcher {
  constructor(webContents) {
    this.webContents = webContents;
  }

  sendError(message, err) {
    this.webContents.send(NEW_MESSAGE, {
      type: ERROR,
      message,
      full: err,
    });
  }

  send(messageId, payload) {
    this.webContents.send(messageId, payload);
  }
}

module.exports = Dispatcher;
