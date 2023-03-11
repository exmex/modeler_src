const ipc = require("node-ipc-socket");
const { v4: uuidv4 } = require("uuid");

const PARENT_TOKEN = process.env.CURRENT_PRODUCT;
const CONNECT_EVENT = "connect";
const ERROR_EVENT = "error";

const CHANNEL = "message";
const DISCONNECT = "disconnect";

class InterApp {
  onMasterReceiveListeners = [];
  onSlaveReceiveListeners = [];
  afterConnectListeners = [];
  onDisconnectListeners = [];

  constructor() {
    this.serverIPC = ipc.default;
    this.clientIPC = new ipc.default.IPC();
    this.tributeryToken = uuidv4();
    this._isMaster = false;

    this.afterError = this.afterError.bind(this);
    this.connected = this.connected.bind(this);
    this.afterConnectTo = this.afterConnectTo.bind(this);
    this.serve = this.serve.bind(this);
    this.slaveReceive = this.slaveReceive.bind(this);
    this.afterConnectExecute = this.afterConnectExecute.bind(this);
    this.afterConnect = this.afterConnect.bind(this);
    this.slaveDisconnect = this.slaveDisconnect.bind(this);
  }

  static _instance = undefined;

  static instance() {
    if (!this._instance) {
      this._instance = new InterApp();
    }
    return this._instance;
  }

  addOnMasterReceiveListener(listener) {
    this.onMasterReceiveListeners.push(listener);
  }

  addOnSlaveReceiveListener(listener) {
    this.onSlaveReceiveListeners.push(listener);
  }

  addAfterConnectListener(listener) {
    this.afterConnectListeners.push(listener);
  }

  addOnDisconnectListeners(listener) {
    this.onDisconnectListeners.push(listener);
  }

  run() {
    this.startSlave();
  }

  afterError(e) {
    this.clientIPC.disconnect(PARENT_TOKEN);
    this.startMaster();
  }

  afterConnect(listener) {
    listener.afterConnect(this);
  }

  connected() {
    this.setIsMaster(false);
    this.afterConnectListeners.forEach(this.afterConnect);
  }

  slaveReceive(data) {
    this.onSlaveReceiveListeners.forEach(async (listener) => {
      await listener.receive(data);
    });
  }

  slaveDisconnect() {
    this.onDisconnectListeners.forEach((listener) => listener.disconnect());
  }

  afterConnectTo() {
    this.clientIPC.of[PARENT_TOKEN].on(CONNECT_EVENT, this.connected);
    this.clientIPC.of[PARENT_TOKEN].on(ERROR_EVENT, this.afterError);
    this.clientIPC.of[PARENT_TOKEN].on(CHANNEL, this.slaveReceive);
    this.clientIPC.of[PARENT_TOKEN].on(DISCONNECT, this.slaveDisconnect);
  }

  startSlave() {
    this.clientIPC.config.id = this.tributeryToken;
    this.clientIPC.config.stopRetrying = 0;
    this.clientIPC.config.silent = true;
    this.clientIPC.connectTo(PARENT_TOKEN, this.afterConnectTo);
  }

  serve(data, socket) {
    try {
      this.onMasterReceiveListeners.forEach(async (listener) => {
        await listener.receive(socket, data);
      });
    } catch (e) {
      console.log(e);
    }
  }

  afterConnectExecute(listener) {
    listener.afterConnect(this);
  }

  startMaster() {
    this.serverIPC.config.id = PARENT_TOKEN;
    this.serverIPC.config.stopRetrying = 0;
    this.serverIPC.config.silent = true;
    this.serverIPC.serve(() => this.serverIPC.server.on(CHANNEL, this.serve));
    try {
      this.serverIPC.server.on("error", (data, socket) => {
        this.startSlave();
      });

      this.serverIPC.server.start();
      this.setIsMaster(true);
      try {
        this.afterConnectListeners.forEach(this.afterConnectExecute);
      } catch (e) {
        console.log(e);
      }
    } catch (e) {
      this.startSlave();
    }
  }

  setIsMaster(value) {
    this._isMaster = value;
  }

  isMaster() {
    return this._isMaster;
  }

  getClientChannel() {
    return !this._isMaster ? this.clientIPC.of[PARENT_TOKEN] : undefined;
  }

  getServer() {
    return this._isMaster ? this.serverIPC.server : undefined;
  }

  getChannelName() {
    return CHANNEL;
  }
}

module.exports = InterApp;
