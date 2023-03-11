const electron = require("electron");
const { app } = electron;
const _ = require("lodash");
const InterApp = require("../interapp/inter_app");
const AfterConnectListener = require("../interapp/after_connect_listener");
const { WebContentDispatcher } = require("./web_content_dispatcher");
const SettingsUnencryptedFileStore = require("../settings/store/settings_unencrypted_file_store");
const SettingsEncryptedFileStore = require("../settings/store/settings_encrypted_file_store");
const UnencryptedFileStore = require("../settings/store/unencrypted_file_store");
const EncryptedFileStore = require("../settings/store/encrypted_file_store");
const MemoryStore = require("../settings/store/memory_store");
const {
  SlaveAppStoreBuilder,
  MASTER_SLAVE_STORE_EVENTS
} = require("./store/slave_app_store");
const AppLifespanStore = require("./store/app_lifespan_store");
const MasterAppListener = require("../interapp/master_app_listener");
const { LicenseChecker } = require("../license/license");
const { v4: uuidv4 } = require("uuid");
const {
  SlaveSessionDetector,
  MasterSessionDetector,
  BackupModelController,
  SESSION_EVENTS
} = require("./session_detector");
const os = require("os");
const fs = require("fs");

const cp = require("child_process");
const path = require("path");
const { encrypt, decrypt } = require("../encrypt/encrypt");
const { exists } = require("../util/fs-advanced");

const APP_STORE_EVENT = {
  SETTINGS_LOAD: "settings:load",
  SETTINGS_SAVE: "settings:save",
  ENCRYPTED_SETTINGS_LOAD: "encryptedSettings:load",
  ENCRYPTED_SETTINGS_SAVE: "encryptedSettings:save",
  SETTINGS_UPDATED: "settings:updated",
  ENCRYPTED_SETTINGS_UPDATED: "encryptedSettings:updated",
  MODEL_SETTINGS_UPDATED: "modelSettings:updated",
  MODEL_SETTINGS_LOAD: "modelSettings:load",
  MODEL_SETTINGS_SAVE: "modelSettings:save",
  MODEL_LIST_UPDATED: "modelList:updated",
  MODEL_LIST_LOAD: "modelList:load",
  MODEL_LIST_SAVE: "modelList:save",
  CONNECTION_LIST_UPDATED: "connectionList:updated",
  CONNECTION_LIST_LOAD: "connectionList:load",
  CONNECTION_LIST_SAVE: "connectionList:save",
  LICENSE_UPDATED: "license:updated",
  LICENSE_LOAD: "license:load",
  LICENSE_SAVE: "license:save",
  RESTORE_UPDATED: "restore:updated",
  RESTORE_LOAD: "restore:load",
  RESTORE_SAVE: "restore:save",
  APP_LIFESPAN_UPDATED: "appLifespan:updated",
  APP_LIFESPAN_LOAD: "appLifespan:load",
  APP_LIFESPAN_SAVE: "appLifespan:save"
};

const STORE = {
  UNENCRYPTED_SETTINGS: "unencrypted_settings",
  ENCRYPTED_SETTINGS: "encrypted_settings",
  MODEL_SETTINGS: "model_settings",
  MODEL_LIST: "model_list",
  CONNECTION_LIST: "connection_list",
  LICENSE: "license",
  RESTORE: "restore",
  APP_LIFESPAN: "app_lifespan"
};

class SettingsContextBuilder extends AfterConnectListener {
  constructor(configurationContext, webContentDispatcher) {
    super();
    this.configurationContext = configurationContext;
    this.webContentDispatcher = webContentDispatcher;
  }

  afterConnect(interApp) {
    const factory = interApp.isMaster()
      ? new MasterSettingsContextStoresFactory(
          this.webContentDispatcher,
          this.configurationContext,
          interApp
        )
      : new SlaveSettingsContextStoresFactory(
          this.webContentDispatcher,
          this.configurationContext,
          interApp
        );
    factory.create();
  }
}

class MasterInterAppSettingsListener extends MasterAppListener {
  constructor(interApp, store) {
    super(interApp);
    this.store = store;
  }

  async receive(socket, data) {
    if (
      data.type === MASTER_SLAVE_STORE_EVENTS.LOAD_MASTER_STORE &&
      data.name === this.store.getName()
    ) {
      await this.store.load();
    }

    if (
      data.type === MASTER_SLAVE_STORE_EVENTS.SAVE_MASTER_STORE &&
      data.name === this.store.getName()
    ) {
      if (data.encrypted === true) {
        const contentText = decrypt(data.content);
        const content = JSON.parse(contentText);
        await this.store.save(content);
      } else {
        await this.store.save(data.content);
      }
    }
  }
}

class SettingsContextStoresFactory {
  constructor(webContentDispatcher, settingsContext, interApp) {
    this.webContentDispatcher = webContentDispatcher;
    this.settingsContext = settingsContext;
    this.interApp = interApp;
  }

  create() {}

  createModelSettingsStore() {
    return new MemoryStore(STORE.MODEL_SETTINGS);
  }
}

class BackModelFileController {
  constructor(settingsContext) {
    this.settingsContext = settingsContext;
  }

  getSessionTmpFolder() {
    return path.join(os.tmpdir(), process.env.CURRENT_PRODUCT);
  }

  getSessionTempFile(sessionIdToRemove) {
    return path.join(this.getSessionTmpFolder(), sessionIdToRemove + ".tmp");
  }

  async save(model) {
    const unsavedModelPath = this.getSessionTempFile(
      this.settingsContext.getSessionId()
    );
    if (!(await exists(this.getSessionTmpFolder()))) {
      await fs.promises.mkdir(this.getSessionTmpFolder());
    }
    await fs.promises.writeFile(unsavedModelPath, JSON.stringify(model));
    const modelModel = model.model;
    return {
      originalModelPath: modelModel.filePath,
      path: unsavedModelPath,
      model: {
        id: modelModel.id,
        name: modelModel.name,
        type: modelModel.type,
        lastSaved: modelModel.lastSaved,
        desc: modelModel.desc
      }
    };
  }

  async remove(sessionIdToRemove) {
    const unsavedModelPath = this.getSessionTempFile(sessionIdToRemove);
    await fs.promises.unlink(unsavedModelPath);
  }
}

class BackupModelMasterAppListener {
  constructor(masterSessionDetector, settingsContext) {
    this.masterSessionDetector = masterSessionDetector;
    this.settingsContext = settingsContext;
    this.backModelFileController = new BackModelFileController(
      this.settingsContext
    );
  }

  async receive(type, event, data) {
    const modelInfo = await this.backModelFileController.save(data.model);
    this.masterSessionDetector.addActive({
      sessionId: this.settingsContext.getSessionId(),
      timestamp: data.timestamp,
      modelInfo
    });
  }
}

class BackupModelSlaveAppListener {
  constructor(slaveSessionDetector, settingsContext) {
    this.slaveSessionDetector = slaveSessionDetector;
    this.settingsContext = settingsContext;
    this.backModelFileController = new BackModelFileController(
      this.settingsContext
    );
  }

  async receive(type, event, data) {
    const modelInfo = await this.backModelFileController.save(data.model);

    this.slaveSessionDetector.emit({
      type: SESSION_EVENTS.RECEIVE_ALIVE,
      sessionId: this.settingsContext.getSessionId(),
      timestamp: data.timestamp,
      modelInfo
    });
  }
}

class ClearBackupModelAppListener {
  constructor(settingsContext) {
    this.settingsContext = settingsContext;
    this.backModelFileController = new BackModelFileController(
      this.settingsContext
    );
  }

  async receive(type, event, data) {
    const restoreContent = this.settingsContext.restoreStore.getContent();
    const sessionIdToRemove =
      data.sessionId ?? this.settingsContext.getSessionId();
    const newRestoreContent = _.omit(restoreContent, sessionIdToRemove);
    await this.settingsContext.restoreStore.save(newRestoreContent);
    try {
      await this.backModelFileController.remove(sessionIdToRemove);
    } catch (e) {}
  }
}

class OpenModelInAnotherInstanceAppListener {
  receive(type, event, data) {
    const subprocess = cp.spawn(process.execPath, [data.filePath], {
      cwd: process.cwd(),
      detached: true,
      stdio: "ignore"
    });
    subprocess.unref();
  }
}

class MasterSettingsContextStoresFactory extends SettingsContextStoresFactory {
  create() {
    const masterSessionDetector = new MasterSessionDetector(
      this.interApp,
      this.settingsContext,
      this.webContentDispatcher
    );

    this.settingsContext.setBackupModelAppListener(
      new BackupModelMasterAppListener(
        masterSessionDetector,
        this.settingsContext
      )
    );

    this.interApp.addOnMasterReceiveListener(masterSessionDetector);
    this.settingsContext.setMasterSessionDetector(masterSessionDetector);

    this.settingsContext.setUnencryptedSettingsStore(
      this.registerStore(
        this.createSettingsUnencryptedFileStore(),
        APP_STORE_EVENT.SETTINGS_UPDATED,
        false
      )
    );

    this.settingsContext.setEncryptedSettingsStore(
      this.registerStore(
        this.createEncryptedSettingsStore(),
        APP_STORE_EVENT.ENCRYPTED_SETTINGS_UPDATED,
        true
      )
    );

    this.settingsContext.setLicenseStore(
      this.registerStore(
        this.createLicenseStore(),
        APP_STORE_EVENT.LICENSE_UPDATED,
        false
      )
    );

    this.settingsContext.setModelListStore(
      this.registerStore(
        this.createModelListStore(),
        APP_STORE_EVENT.MODEL_LIST_UPDATED,
        false
      )
    );
    this.settingsContext.setConnectionListStore(
      this.registerStore(
        this.createConnectionListStore(),
        APP_STORE_EVENT.CONNECTION_LIST_UPDATED,
        true
      )
    );

    this.settingsContext.setModelSettingsStore(
      this.createModelSettingsStore(),
      APP_STORE_EVENT.MODEL_SETTINGS_UPDATED,
      false
    );

    this.settingsContext.setRestoreStore(
      this.registerStore(
        this.createRestoreStore(),
        APP_STORE_EVENT.RESTORE_UPDATED,
        false
      )
    );

    this.settingsContext.setAppLifespanStore(
      this.registerStore(
        this.createAppLifespanStore(),
        APP_STORE_EVENT.APP_LIFESPAN_UPDATED,
        false
      )
    );

    const backupModelController = new BackupModelController(
      this.settingsContext,
      masterSessionDetector
    );
    this.settingsContext.setBackupModelController(backupModelController);
    this.settingsContext.unencryptedSettingsStore.addAfterChangeListener(
      backupModelController
    );
    (async () => {
      await this.settingsContext.unencryptedSettingsStore.load();
    })();
  }

  createSettingsUnencryptedFileStore() {
    return new SettingsUnencryptedFileStore(
      STORE.UNENCRYPTED_SETTINGS,
      `${app.getPath("userData")}/settings.json`
    );
  }

  createRestoreStore() {
    return new UnencryptedFileStore(
      STORE.RESTORE,
      `${app.getPath("userData")}/restore.json`
    );
  }

  createAppLifespanStore() {
    return new AppLifespanStore(
      STORE.APP_LIFESPAN,
      `${app.getPath("userData")}/dt.asar.sys`
    );
  }

  createEncryptedSettingsStore() {
    return new SettingsEncryptedFileStore(
      STORE.ENCRYPTED_SETTINGS,
      `${app.getPath("userData")}/esettings.json`
    );
  }

  createLicenseStore() {
    return new EncryptedFileStore(
      STORE.LICENSE,
      `${app.getPath("userData")}/dts.asar.sys`
    );
  }

  createModelListStore() {
    return new UnencryptedFileStore(
      STORE.MODEL_LIST,
      `${app.getPath("userData")}/dataxModels.json`
    );
  }

  createConnectionListStore() {
    return new EncryptedFileStore(
      STORE.CONNECTION_LIST,
      `${app.getPath("userData")}/dataxCn.json`
    );
  }

  registerStore(store, updateEventName, encrypted) {
    const masterInterAppSettingsListener = new MasterInterAppSettingsListener(
      this.interApp,
      store,
      encrypted
    );

    const storeChangedListener = {
      afterChange: ({ name, content }) => {
        this.webContentDispatcher.send(updateEventName, {
          content,
          name
        });

        masterInterAppSettingsListener.broadcast({
          type: MASTER_SLAVE_STORE_EVENTS.SEND_MASTER_STORE,
          encrypted,
          content:
            encrypted === true ? encrypt(JSON.stringify(content)) : content,
          name
        });
      }
    };

    store.addAfterChangeListener(storeChangedListener);
    this.interApp.addOnMasterReceiveListener(masterInterAppSettingsListener);
    (async () => {
      await store.load();
    })();

    return store;
  }
}

class SlaveSettingsContextStoresFactory extends SettingsContextStoresFactory {
  create() {
    this.settingsContext.setMasterSessionDetector(undefined);
    this.settingsContext.getBackupModelController()?.stop();
    const slaveSessionDetector = new SlaveSessionDetector(
      this.interApp,
      this.settingsContext,
      this.webContentDispatcher
    );

    this.settingsContext.setBackupModelAppListener(
      new BackupModelSlaveAppListener(
        slaveSessionDetector,
        this.settingsContext
      )
    );

    this.interApp.addOnSlaveReceiveListener(slaveSessionDetector);

    this.settingsContext.setUnencryptedSettingsStore(
      this.registerSlaveStore(
        STORE.UNENCRYPTED_SETTINGS,
        APP_STORE_EVENT.SETTINGS_UPDATED,
        false
      )
    );

    this.settingsContext.setRestoreStore(
      this.registerSlaveStore(
        STORE.RESTORE,
        APP_STORE_EVENT.RESTORE_UPDATED,
        false
      )
    );

    this.settingsContext.setAppLifespanStore(
      this.registerSlaveStore(
        STORE.APP_LIFESPAN,
        APP_STORE_EVENT.APP_LIFESPAN_UPDATED,
        false
      )
    );

    this.settingsContext.setEncryptedSettingsStore(
      this.registerSlaveStore(
        STORE.ENCRYPTED_SETTINGS,
        APP_STORE_EVENT.ENCRYPTED_SETTINGS_UPDATED,
        true
      )
    );

    this.settingsContext.setLicenseStore(
      this.registerSlaveStore(
        STORE.LICENSE,
        APP_STORE_EVENT.LICENSE_UPDATED,
        false
      )
    );

    this.settingsContext.setModelListStore(
      this.registerSlaveStore(
        STORE.MODEL_LIST,
        APP_STORE_EVENT.MODEL_LIST_UPDATED,
        false
      )
    );

    this.settingsContext.setConnectionListStore(
      this.registerSlaveStore(
        STORE.CONNECTION_LIST,
        APP_STORE_EVENT.CONNECTION_LIST_UPDATED,
        true
      )
    );

    this.settingsContext.setModelSettingsStore(
      this.createModelSettingsStore(),
      APP_STORE_EVENT.MODEL_SETTINGS_UPDATED
    );

    this.interApp.addOnDisconnectListeners({
      disconnect: () => {
        this.settingsContext.unencryptedSettingsStore.close();
        this.settingsContext.encryptedSettingsStore.close();
        this.settingsContext.modelListStore.close();
        this.settingsContext.connectionListStore.close();
        this.settingsContext.licenseStore.close();
        this.settingsContext.restoreStore.close();
      }
    });

    return this.settingsContext;
  }

  registerSlaveStore(name, updateEventName, encrypted) {
    const slaveStore = SlaveAppStoreBuilder.build(
      name,
      this.interApp,
      encrypted
    );
    slaveStore.addAfterChangeListener({
      afterChange: ({ name, content }) => {
        this.webContentDispatcher.send(updateEventName, {
          content,
          name
        });
      }
    });
    return slaveStore;
  }
}

class SettingsContextFactory {
  static createSettingsContext(mainWindow, ipcMain, productName) {
    const settingsContext = new SettingsContext();

    const interApp = InterApp.instance();

    const webContentDispatcher = new WebContentDispatcher(ipcMain, mainWindow);

    SettingsContextFactory.registerUnencryptedSettingsStoreToApp(
      webContentDispatcher,
      settingsContext
    );

    SettingsContextFactory.registerRestoreStoreToApp(
      webContentDispatcher,
      settingsContext
    );

    SettingsContextFactory.registerAppLifespanStoreToApp(
      webContentDispatcher,
      settingsContext
    );

    SettingsContextFactory.registerEncryptedSettingsStoreToApp(
      webContentDispatcher,
      settingsContext
    );

    SettingsContextFactory.registerConnectionListStoreToApp(
      webContentDispatcher,
      settingsContext
    );

    SettingsContextFactory.registerModelListStoreToApp(
      webContentDispatcher,
      settingsContext
    );

    SettingsContextFactory.registerModelSettingsStoreToApp(
      webContentDispatcher,
      settingsContext
    );

    SettingsContextFactory.registerLicenseStoreToApp(
      webContentDispatcher,
      settingsContext,
      productName
    );

    SettingsContextFactory.registerBackupModelToApp(
      webContentDispatcher,
      settingsContext
    );

    SettingsContextFactory.registerOpenModelInAnotherInstance(
      webContentDispatcher
    );

    const afterConnectListener = new SettingsContextBuilder(
      settingsContext,
      webContentDispatcher
    );

    interApp.addAfterConnectListener(afterConnectListener);
    interApp.run();

    return settingsContext;
  }

  static registerEncryptedSettingsStoreToApp(
    webContentDispatcher,
    settingsContext
  ) {
    webContentDispatcher.addReceiveListener(
      APP_STORE_EVENT.ENCRYPTED_SETTINGS_LOAD,
      {
        receive: async (type, event, data) => {
          await settingsContext.encryptedSettingsStore?.load();
        }
      }
    );

    webContentDispatcher.addReceiveListener(
      APP_STORE_EVENT.ENCRYPTED_SETTINGS_SAVE,
      {
        receive: async (type, event, data) => {
          await settingsContext.encryptedSettingsStore?.save(data);
        }
      }
    );
  }

  static registerRestoreStoreToApp(webContentDispatcher, settingsContext) {
    webContentDispatcher.addReceiveListener(APP_STORE_EVENT.RESTORE_LOAD, {
      receive: async (type, event, data) => {
        await settingsContext.restoreStore?.load();
      }
    });

    webContentDispatcher.addReceiveListener(APP_STORE_EVENT.RESTORE_SAVE, {
      receive: async (type, event, data) => {
        await settingsContext.restoreStore?.save(data);
      }
    });
  }

  static registerAppLifespanStoreToApp(webContentDispatcher, settingsContext) {
    webContentDispatcher.addReceiveListener(APP_STORE_EVENT.APP_LIFESPAN_LOAD, {
      receive: async (type, event, data) => {
        console.log("APP_LIFESPAN_LOAD");
        await settingsContext.appLifespanStore?.load();
      }
    });

    webContentDispatcher.addReceiveListener(APP_STORE_EVENT.APP_LIFESPAN_SAVE, {
      receive: async (type, event, data) => {
        await settingsContext.appLifespanStore?.save(data);
      }
    });
  }

  static registerBackupModelToApp(webContentDispatcher, settingsContext) {
    webContentDispatcher.addReceiveListener("restore:backupModel", {
      receive: async (type, event, data) => {
        await settingsContext
          .getBackupModelAppListener()
          .receive(type, event, data);
      }
    });

    webContentDispatcher.addReceiveListener(
      "restore:clearBackupModel",
      new ClearBackupModelAppListener(settingsContext)
    );
  }

  static registerOpenModelInAnotherInstance(webContentDispatcher) {
    webContentDispatcher.addReceiveListener(
      "modelList:openModelInAnotherInstance",
      new OpenModelInAnotherInstanceAppListener()
    );
  }

  static registerLicenseStoreToApp(
    webContentDispatcher,
    settingsContext,
    productName
  ) {
    webContentDispatcher.addReceiveListener(APP_STORE_EVENT.LICENSE_LOAD, {
      receive: async (type, event, data) => {
        console.log("load license");
        await settingsContext.licenseStore?.load();
      }
    });

    webContentDispatcher.addReceiveListener(APP_STORE_EVENT.LICENSE_SAVE, {
      receive: async (type, event, data) => {
        const licenseChecker = new LicenseChecker(productName, settingsContext);
        const result = await licenseChecker.checkNewLicenses(data);
        console.log("save license", result);
        if (result.error) {
          webContentDispatcher.send(APP_STORE_EVENT.LICENSE_UPDATED, result);
        } else {
          await settingsContext.licenseStore?.save(result.content);
        }
      }
    });
  }

  static registerConnectionListStoreToApp(
    webContentDispatcher,
    settingsContext
  ) {
    webContentDispatcher.addReceiveListener(
      APP_STORE_EVENT.CONNECTION_LIST_LOAD,
      {
        receive: async (type, event, data) => {
          await settingsContext.connectionListStore?.load();
        }
      }
    );

    webContentDispatcher.addReceiveListener(
      APP_STORE_EVENT.CONNECTION_LIST_SAVE,
      {
        receive: async (type, event, data) => {
          await settingsContext.connectionListStore?.save(data);
        }
      }
    );
  }

  static registerUnencryptedSettingsStoreToApp(
    webContentDispatcher,
    settingsContext
  ) {
    webContentDispatcher.addReceiveListener(APP_STORE_EVENT.SETTINGS_LOAD, {
      receive: async (type, event, data) => {
        await settingsContext.unencryptedSettingsStore?.load();
      }
    });

    webContentDispatcher.addReceiveListener(APP_STORE_EVENT.SETTINGS_SAVE, {
      receive: async (type, event, data) => {
        await settingsContext.unencryptedSettingsStore?.save(data);
      }
    });
  }

  static registerModelListStoreToApp(webContentDispatcher, settingsContext) {
    webContentDispatcher.addReceiveListener(APP_STORE_EVENT.MODEL_LIST_LOAD, {
      receive: async (type, event, data) => {
        await settingsContext.modelListStore?.load();
      }
    });

    webContentDispatcher.addReceiveListener(APP_STORE_EVENT.MODEL_LIST_SAVE, {
      receive: async (type, event, data) => {
        await settingsContext.modelListStore?.save(data);
      }
    });
  }

  static registerModelSettingsStoreToApp(
    webContentDispatcher,
    settingsContext
  ) {
    webContentDispatcher.addReceiveListener(
      APP_STORE_EVENT.MODEL_SETTINGS_LOAD,
      {
        receive: async (type, event, data) => {
          await settingsContext.modelSettingsStore?.load();
        }
      }
    );

    webContentDispatcher.addReceiveListener(
      APP_STORE_EVENT.MODEL_SETTINGS_SAVE,
      {
        receive: async (type, event, data) => {
          await settingsContext.modelSettingsStore?.save(data);
        }
      }
    );
  }
}

class SettingsContext {
  static _instance = undefined;

  static instance(mainWindow, ipcMain, productName) {
    if (SettingsContext._instance === undefined) {
      SettingsContext._instance = SettingsContextFactory.createSettingsContext(
        mainWindow,
        ipcMain,
        productName
      );
    }
    return SettingsContext._instance;
  }

  constructor() {
    this.sessionId = uuidv4();
  }

  setUnencryptedSettingsStore(unencryptedSettingsStore) {
    this.unencryptedSettingsStore = unencryptedSettingsStore;
  }

  setRestoreStore(restoreStore) {
    this.restoreStore = restoreStore;
  }

  setAppLifespanStore(appLifespanStore) {
    this.appLifespanStore = appLifespanStore;
  }

  setEncryptedSettingsStore(encryptedSettingsStore) {
    this.encryptedSettingsStore = encryptedSettingsStore;
  }

  setLicenseStore(licenseStore) {
    this.licenseStore = licenseStore;
  }

  setModelSettingsStore(modelSettingsStore) {
    this.modelSettingsStore = modelSettingsStore;
  }

  setConnectionListStore(connectionListStore) {
    this.connectionListStore = connectionListStore;
  }

  setModelListStore(modelListStore) {
    this.modelListStore = modelListStore;
  }

  getModelList() {
    return this.modelListStore.getContent();
  }

  setModelList(modelList) {
    (async () => {
      await this.modelListStore.save(modelList);
    })();
  }

  getDefaultPath() {
    return this.unencryptedSettingsStore.getContent().defaultPath;
  }

  setDefaultPath(defaultPath) {
    (async () => {
      await this.unencryptedSettingsStore.save({
        ...this.unencryptedSettingsStore.getContent(),
        defaultPath
      });
    })();
  }

  getModelPdfReportFilePath() {
    return this.modelSettingsStore.getContent().modelPdfReportPath;
  }

  setModelPdfReportFilePath(modelPdfReportPath) {
    (async () => {
      await this.modelSettingsStore.save({
        ...this.modelSettingsStore.getContent(),
        modelPdfReportPath
      });
    })();
  }

  getModelHTMLReportDir() {
    return this.modelSettingsStore.getContent().modelHTMLReportDir;
  }

  setModelHTMLReportDir(modelHTMLReportDir) {
    (async () => {
      await this.modelSettingsStore.save({
        ...this.modelSettingsStore.getContent(),
        modelHTMLReportDir
      });
    })();
  }

  getModelScriptFilePath() {
    return this.modelSettingsStore.getContent().modelScriptFilePath;
  }

  setModelScriptFilePath(modelScriptFilePath) {
    (async () => {
      await this.modelSettingsStore.save({
        ...this.modelSettingsStore.getContent(),
        modelScriptFilePath
      });
    })();
  }

  getModelScriptsDir() {
    return this.modelSettingsStore.getContent().modelScriptsDir;
  }

  setModelScriptsDir(modelScriptsDir) {
    (async () => {
      await this.modelSettingsStore.save({
        ...this.modelSettingsStore.getContent(),
        modelScriptsDir
      });
    })();
  }

  setLicense(license) {
    (async () => {
      await this.licenseStore?.save(license);
    })();
  }

  getLicense() {
    return this.licenseStore.getContent();
  }

  getProxy() {
    return this.encryptedSettingsStore.getContent().proxy;
  }

  getSessionId() {
    return this.sessionId;
  }

  getRestore() {
    return this.restoreStore?.getContent();
  }

  setRestore(restore) {
    (async () => {
      await this.restoreStore?.save(restore);
    })();
  }

  setMasterSessionDetector(masterSessionDetector) {
    this.masterSessionDetector = masterSessionDetector;
  }

  getBackupModelAppListener() {
    return this.backupModelAppListener;
  }

  setBackupModelAppListener(backupModelAppListener) {
    this.backupModelAppListener = backupModelAppListener;
  }

  getBackupModelController() {
    return this.backupModelController;
  }

  setBackupModelController(backupModelController) {
    this.backupModelController = backupModelController;
  }
}

module.exports = SettingsContext;
