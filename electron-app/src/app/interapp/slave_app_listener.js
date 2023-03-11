class SlaveAppListener {
  constructor(interApp) {
    this.interApp = interApp;
  }

  receive(data) {}

  emit(message) {
    this.interApp
      .getClientChannel()
      .emit(this.interApp.getChannelName(), message);
  }
}

module.exports = SlaveAppListener;
