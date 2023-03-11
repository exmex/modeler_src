const SlaveAppListener = require("../../interapp/slave_app_listener");
const Store = require("./store");
const { decrypt, encrypt } = require("../../encrypt/encrypt");

const MASTER_SLAVE_STORE_EVENTS = {
  LOAD_MASTER_STORE: "loadMasterStore",
  SAVE_MASTER_STORE: "saveMasterStore",
  SEND_MASTER_STORE: "sendMasterStore"
};

class SlaveAppStoreBuilder {
  static build(name, interApp, encrypted) {
    const slaveAppStore = new SlaveAppStore(name, encrypted);

    const masterStoreChangeListener = new MasterStoreChangeListener(
      interApp,
      slaveAppStore
    );
    interApp.addOnSlaveReceiveListener(masterStoreChangeListener);
    slaveAppStore.registerMasterStoreChangeListener(masterStoreChangeListener);
    return slaveAppStore;
  }
}

class MasterStoreChangeListener extends SlaveAppListener {
  constructor(interApp, slaveAppStore) {
    super(interApp);
    this.slaveAppStore = slaveAppStore;
  }

  async receive(data) {
    if (
      data.type === MASTER_SLAVE_STORE_EVENTS.SEND_MASTER_STORE &&
      data.name === this.slaveAppStore.name
    ) {
      try {
        this.slaveAppStore.setContent(
          data.encrypted === true
            ? JSON.parse(decrypt(data.content), null, 2)
            : data.content
        );
        this.slaveAppStore.afterChange();
      } catch (e) {
        console.log(e);
      }
    }
  }
}

class SlaveAppStore extends Store {
  masterStoreChangeListener = undefined;

  constructor(name, encrypted) {
    super(name);
    this.encrypted = encrypted;
  }

  registerMasterStoreChangeListener(masterStoreChangeListener) {
    this.masterStoreChangeListener = masterStoreChangeListener;
  }

  async load() {
    this.masterStoreChangeListener?.emit({
      type: MASTER_SLAVE_STORE_EVENTS.LOAD_MASTER_STORE,
      name: this.name,
      encrypted: this.encrypted
    });
  }

  async save(content) {
    this.masterStoreChangeListener?.emit({
      type: MASTER_SLAVE_STORE_EVENTS.SAVE_MASTER_STORE,
      name: this.name,
      encrypted: this.encrypted,
      content:
        this.encrypted === true ? encrypt(JSON.stringify(content)) : content
    });
  }

  close() {
    this.masterStoreChangeListener = undefined;
  }
}

module.exports = {
  SlaveAppStore,
  SlaveAppStoreBuilder,
  MASTER_SLAVE_STORE_EVENTS
};
