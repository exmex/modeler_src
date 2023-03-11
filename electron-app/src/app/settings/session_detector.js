const SlaveAppListener = require("../interapp/slave_app_listener");
const MasterAppListener = require("../interapp/master_app_listener");
const _ = require("lodash");

const SESSION_EVENTS = {
  SEND_ALIVE: "send_alive",
  RECEIVE_ALIVE: "receive_alive"
};
const TIMEOUT_MS = 1000;

class SlaveSessionDetector extends SlaveAppListener {
  constructor(interApp, settingsContext, webContentDispatcher) {
    super(interApp);
    this.settingsContext = settingsContext;
    this.webContentDispatcher = webContentDispatcher;
  }

  receive(data) {
    if (data.type === SESSION_EVENTS.SEND_ALIVE) {
      this.webContentDispatcher.send("restore:backupTick", {
        timestamp: data.timestamp
      });
    }
  }
}

class MasterSessionDetector extends MasterAppListener {
  constructor(interApp, settingsContext, webContentDispatcher) {
    super(interApp);
    this.settingsContext = settingsContext;
    this.webContentDispatcher = webContentDispatcher;
    this.active = {};
  }

  addActive(item) {
    this.active[item.sessionId] = item;
  }

  async receive(socket, data) {
    if (data.type === SESSION_EVENTS.RECEIVE_ALIVE) {
      this.addActive({
        sessionId: data.sessionId,
        modelInfo: data.modelInfo
      });
    }
  }

  async detect(timestamp) {
    this.activeOnStart = this.settingsContext.getRestore();
    this.webContentDispatcher.send("restore:backupTick", { timestamp });
    this.broadcast({ type: SESSION_EVENTS.SEND_ALIVE, timestamp });

    this.active = {};
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve(this.active);
      }, TIMEOUT_MS)
    );
  }
}

const BackupModelTime = {
  NEVER: "never",
  FIVE_SECONDS: "5seconds",
  MINUTE: "minute",
  FIVE_MINUTES: "5minutes"
};

const SECOND_IN_MS = 1000;
const MINUTE_IN_MS = 1000 * 60;

class BackupModelController {
  constructor(settingsContext, masterSessionDetector) {
    this.settingsContext = settingsContext;
    this.masterSessionDetector = masterSessionDetector;
    this.backupModelTime = undefined;
    this.intervalId = undefined;

    this.beat = this.beat.bind(this);
  }

  convertSettingsToTime(backupModelTime) {
    switch (backupModelTime) {
      case BackupModelTime.NEVER:
        return 0;
      case BackupModelTime.FIVE_SECONDS:
        return 5 * SECOND_IN_MS;
      case BackupModelTime.MINUTE:
        return MINUTE_IN_MS;
      case BackupModelTime.FIVE_MINUTES:
        return 5 * MINUTE_IN_MS;
    }
  }

  async beat() {
    let timestamp = this.settingsContext.restoreStore?.changeTimestamp;
    let detected = await this.masterSessionDetector.detect(timestamp);
    let currentRestoreChangeTimestamp =
      this.settingsContext.restoreStore?.changeTimestamp;
    let retry = 5;

    while (timestamp !== currentRestoreChangeTimestamp && retry >= 0) {
      timestamp = this.settingsContext.restoreStore?.changeTimestamp;
      detected = await this.masterSessionDetector.detect(timestamp);
      currentRestoreChangeTimestamp =
        this.settingsContext.restoreStore?.changeTimestamp;
      retry--;
    }

    if (timestamp !== currentRestoreChangeTimestamp) {
      return;
    }

    const currentRestore = this.settingsContext.getRestore();
    const newRestore = _.reduce(
      currentRestore,
      (r, i) => {
        if (!detected[i.sessionId]) {
          return { ...r, [i.sessionId]: { ...i, brokenApp: true } };
        }
        return { ...r, [i.sessionId]: i };
      },
      detected
    );
    this.settingsContext.setRestore(newRestore);
  }

  afterChange() {
    if (
      this.settingsContext.unencryptedSettingsStore?.getContent()
        ?.backupModelTime !== this.backupModelTime
    ) {
      this.stop();
      const timems = this.convertSettingsToTime(
        this.settingsContext.unencryptedSettingsStore?.getContent()
          ?.backupModelTime ?? 0
      );
      if (timems > 0) {
        setTimeout(this.beat, 1);
        this.intervalId = setInterval(this.beat, timems);
      } else {
        (async () => {
          await this.settingsContext.restoreStore.save({});
        })();
      }
      this.backupModelTime =
        this.settingsContext.unencryptedSettingsStore?.getContent()?.backupModelTime;
    }
  }

  stop() {
    if (!!this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }
}

module.exports = {
  SlaveSessionDetector,
  MasterSessionDetector,
  BackupModelController,
  SESSION_EVENTS
};
