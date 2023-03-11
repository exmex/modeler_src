const { describe, expect } = require("@jest/globals");
const {
  SlaveAppStoreBuilder,
  MASTER_SLAVE_STORE_EVENTS
} = require("../slave_app_store");
const { encrypt, decrypt } = require("../../../encrypt/encrypt");

class InterAppMock {
  constructor(storeName, storeContent) {
    this.storeName = storeName;
    this.storeContent = storeContent;
  }
  masterStoreChangeListener = undefined;
  getChannelName() {
    return "store";
  }
  addOnSlaveReceiveListener(masterStoreChangeListener) {
    this.masterStoreChangeListener = masterStoreChangeListener;
  }
  getClientChannel() {
    return {
      emit: (channelName, message) => {
        if (message.type === MASTER_SLAVE_STORE_EVENTS.LOAD_MASTER_STORE) {
          const contentText = JSON.stringify(this.storeContent);
          const encryptedContentText = encrypt(contentText);
          (async () => {
            await this.masterStoreChangeListener.receive({
              type: MASTER_SLAVE_STORE_EVENTS.SEND_MASTER_STORE,
              name: this.storeName,
              encryptedContentText
            });
          })();
        }
        if (message.type === MASTER_SLAVE_STORE_EVENTS.SAVE_MASTER_STORE) {
          (async () => {
            await this.masterStoreChangeListener.receive({
              type: MASTER_SLAVE_STORE_EVENTS.SEND_MASTER_STORE,
              name: message.name,
              encryptedContentText: message.encryptedContentText
            });
          })();
        }
      }
    };
  }
}

describe.skip("[Unit] Slave App Store", () => {
  it("should load data from master", async () => {
    // given
    const storeName = "master";
    const storeContent = { store: "content" };
    const slaveAppStore = SlaveAppStoreBuilder.build(
      storeName,
      new InterAppMock(storeName, storeContent),
      false
    );

    // when
    await slaveAppStore.load();

    // then
    const result = slaveAppStore.getContent();
    expect(result).toEqual(storeContent);
  });

  it("should save data to master", async () => {
    // given
    const storeName = "master";
    const storeContent = { store: "content" };
    const modifiedStoreContent = { store: "savedContent" };
    const slaveAppStore = SlaveAppStoreBuilder.build(
      storeName,
      new InterAppMock(storeName, storeContent),
      false
    );

    // when
    await slaveAppStore.save(modifiedStoreContent);

    // then
    const result = slaveAppStore.getContent();
    expect(result).toEqual(modifiedStoreContent);
  });
});
