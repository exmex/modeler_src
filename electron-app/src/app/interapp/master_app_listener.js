class MasterAppListener {
  constructor(interApp) {
    this.interApp = interApp;
  }

  receive(socket, data) {}

  emit(socket, message) {
    this.interApp
      .getServer()
      .emit(socket, this.interApp.getChannelName(), message);
  }

  broadcast(message) {
    this.interApp
      .getServer()
      .broadcast(this.interApp.getChannelName(), message);
  }
}

module.exports = MasterAppListener;
