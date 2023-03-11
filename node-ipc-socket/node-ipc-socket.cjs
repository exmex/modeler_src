var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};

// node-ipc-socket.js
__export(exports, {
  IPCModule: () => IPCModule,
  default: () => singleton
});

// entities/Defaults.js
var import_os = __toModule(require("os"));
var Defaults = class {
  constructor() {
    __publicField(this, "appspace", "app.");
    __publicField(this, "socketRoot", "/tmp/");
    __publicField(this, "id", import_os.default.hostname());
    __publicField(this, "encoding", "utf8");
    __publicField(this, "unlink", true);
    __publicField(this, "delimiter", "\f");
    __publicField(this, "silent", false);
    __publicField(this, "logDepth", 5);
    __publicField(this, "logInColor", true);
    __publicField(this, "logger", console.log.bind(console));
    __publicField(this, "maxConnections", 100);
    __publicField(this, "retry", 500);
    __publicField(this, "maxRetries", Infinity);
    __publicField(this, "stopRetrying", false);
    __publicField(this, "readableAll", false);
    __publicField(this, "writableAll", false);
  }
};

// entities/EventParser.js
var Parser = class {
  constructor(config) {
    if (!config) {
      config = new Defaults();
    }
    this.delimiter = config.delimiter;
  }
  format(message) {
    if (!message.data && message.data !== false && message.data !== 0) {
      message.data = {};
    }
    if (message.data["_maxListeners"]) {
      message.data = {};
    }
    message = message.JSON + this.delimiter;
    return message;
  }
  parse(data) {
    let events = data.split(this.delimiter);
    events.pop();
    return events;
  }
};

// utils/event-pubsub.js
var _handleOnce, _all, _once, _events;
var EventPubSub = class {
  constructor() {
    __privateAdd(this, _handleOnce, (type, handlers, ...args) => {
      const deleteOnceHandled = [];
      for (let handler of handlers) {
        handler(...args);
        if (handler[__privateGet(this, _once)]) {
          deleteOnceHandled.push(handler);
        }
      }
      for (let handler of deleteOnceHandled) {
        this.off(type, handler);
      }
    });
    __privateAdd(this, _all, Symbol.for("event-pubsub-all"));
    __privateAdd(this, _once, Symbol.for("event-pubsub-once"));
    __privateAdd(this, _events, {});
  }
  on(type, handler, once = false) {
    if (type == "*") {
      type = __privateGet(this, _all);
    }
    if (!__privateGet(this, _events)[type]) {
      __privateGet(this, _events)[type] = [];
    }
    handler[__privateGet(this, _once)] = once;
    __privateGet(this, _events)[type].push(handler);
    return this;
  }
  once(type, handler) {
    return this.on(type, handler, true);
  }
  off(type = "*", handler = "*") {
    if (type == __privateGet(this, _all).toString() || type == "*") {
      type = __privateGet(this, _all);
    }
    if (!__privateGet(this, _events)[type]) {
      return this;
    }
    if (handler == "*") {
      delete __privateGet(this, _events)[type];
      return this;
    }
    const handlers = __privateGet(this, _events)[type];
    while (handlers.includes(handler)) {
      handlers.splice(handlers.indexOf(handler), 1);
    }
    if (handlers.length < 1) {
      delete __privateGet(this, _events)[type];
    }
    return this;
  }
  emit(type, ...args) {
    const globalHandlers = __privateGet(this, _events)[__privateGet(this, _all)] || [];
    __privateGet(this, _handleOnce).call(this, __privateGet(this, _all).toString(), globalHandlers, type, ...args);
    if (!__privateGet(this, _events)[type]) {
      return this;
    }
    const handlers = __privateGet(this, _events)[type];
    __privateGet(this, _handleOnce).call(this, type, handlers, ...args);
    return this;
  }
  reset() {
    this.off(__privateGet(this, _all).toString());
    for (let type in __privateGet(this, _events)) {
      this.off(type);
    }
    return this;
  }
  get list() {
    return Object.assign({}, __privateGet(this, _events));
  }
};
_handleOnce = new WeakMap();
_all = new WeakMap();
_once = new WeakMap();
_events = new WeakMap();

// utils/message.js
function Message() {
  Object.defineProperties(this, {
    data: {
      enumerable: true,
      get: getData,
      set: setData
    },
    type: {
      enumerable: true,
      get: getType,
      set: setType
    },
    load: {
      enumerable: true,
      writable: false,
      value: parse
    },
    JSON: {
      enumerable: true,
      get: getJSON
    }
  });
  var type = "";
  var data = {};
  function getType() {
    return type;
  }
  function getData() {
    return data;
  }
  function getJSON() {
    return JSON.stringify({
      type,
      data
    });
  }
  function setType(value) {
    type = value;
  }
  function setData(value) {
    data = value;
  }
  function parse(message) {
    try {
      var message = JSON.parse(message);
      type = message.type;
      data = message.data;
    } catch (err) {
      var badMessage = message;
      type = "error", data = {
        message: "Invalid JSON response format",
        err,
        response: badMessage
      };
    }
  }
}

// dao/client.js
var import_net = __toModule(require("net"));
var eventParser = new Parser();
var Client = class extends EventPubSub {
  constructor(config, log2) {
    super();
    __publicField(this, "Client", Client);
    __publicField(this, "socket", false);
    __publicField(this, "connect", connect);
    __publicField(this, "emit", emit);
    __publicField(this, "retriesRemaining", 0);
    __publicField(this, "explicitlyDisconnected", false);
    this.config = config;
    this.log = log2;
    this.publish = super.emit;
    config.maxRetries ? this.retriesRemaining = config.maxRetries : 0;
    eventParser = new Parser(this.config);
  }
};
function emit(type, data) {
  this.log("dispatching event to ", this.id, this.path, " : ", type, ",", data);
  let message = new Message();
  message.type = type;
  message.data = data;
  message = eventParser.format(message);
  this.socket.write(message);
}
function connect() {
  let client = this;
  client.log("requested connection to ", client.id, client.path);
  if (!this.path) {
    client.log("\n\n######\nerror: ", client.id, " client has not specified socket path it wishes to connect to.");
    return;
  }
  const options = {};
  client.log("Connecting client on Unix Socket :", client.path);
  options.path = client.path;
  if (process.platform === "win32" && !client.path.startsWith("\\\\.\\pipe\\")) {
    options.path = options.path.replace(/^\//, "");
    options.path = options.path.replace(/\//g, "-");
    options.path = `\\\\.\\pipe\\${options.path}`;
  }
  client.socket = import_net.default.connect(options);
  client.socket.setEncoding(this.config.encoding);
  client.socket.on("error", function(err) {
    client.log("\n\n######\nerror: ", err);
    client.publish("error", err);
  });
  client.socket.on("connect", function connectionMade() {
    client.publish("connect");
    client.retriesRemaining = client.config.maxRetries;
    client.log("retrying reset");
  });
  client.socket.on("close", function connectionClosed() {
    client.log("connection closed", client.id, client.path, client.retriesRemaining, "tries remaining of", client.config.maxRetries);
    if (client.config.stopRetrying || client.retriesRemaining < 1 || client.explicitlyDisconnected) {
      client.publish("disconnect");
      client.log(client.config.id, "exceeded connection rety amount of", " or stopRetrying flag set.");
      client.socket.destroy();
      client.publish("destroy");
      client = void 0;
      return;
    }
    setTimeout(function retryTimeout() {
      if (client.explicitlyDisconnected) {
        return;
      }
      client.retriesRemaining--;
      client.connect();
    }.bind(null, client), client.config.retry);
    client.publish("disconnect");
  });
  client.socket.on("data", function(data) {
    if (!this.ipcBuffer) {
      this.ipcBuffer = "";
    }
    data = this.ipcBuffer += data;
    if (data.slice(-1) != eventParser.delimiter || data.indexOf(eventParser.delimiter) == -1) {
      client.log("Messages are large, You may want to consider smaller messages.");
      return;
    }
    this.ipcBuffer = "";
    const events = eventParser.parse(data);
    const eCount = events.length;
    for (let i = 0; i < eCount; i++) {
      let message = new Message();
      message.load(events[i]);
      client.log("detected event", message.type, message.data);
      client.publish(message.type, message.data);
    }
  });
}

// dao/socketServer.js
var import_fs = __toModule(require("fs"));
var import_net2 = __toModule(require("net"));
var eventParser2 = new Parser();
var Server = class extends EventPubSub {
  constructor(path, config, log2, port) {
    super();
    __publicField(this, "server", false);
    __publicField(this, "sockets", []);
    __publicField(this, "emit", emit2);
    __publicField(this, "broadcast", broadcast);
    this.config = config;
    this.path = path;
    this.port = port;
    this.log = log2;
    this.publish = super.emit;
    eventParser2 = new Parser(this.config);
    this.on("close", serverClosed.bind(this));
  }
  onStart(socket) {
    this.publish("start", socket);
  }
  stop() {
    this.server.close();
  }
  start() {
    if (!this.path) {
      this.log("Socket Server Path not specified, refusing to start");
      return;
    }
    if (this.config.unlink) {
      import_fs.default.unlink(this.path, startServer.bind(this));
    } else {
      startServer.bind(this)();
    }
  }
};
function emit2(socket, type, data) {
  this.log("dispatching event to socket", " : ", type, data);
  let message = new Message();
  message.type = type;
  message.data = data;
  this.log(this.config.encoding);
  message = eventParser2.format(message);
  socket.write(message);
}
function broadcast(type, data) {
  this.log("broadcasting event to all known sockets listening to ", this.path, " : ", this.port ? this.port : "", type, data);
  let message = new Message();
  message.type = type;
  message.data = data;
  message = eventParser2.format(message);
  for (let i = 0, count = this.sockets.length; i < count; i++) {
    this.sockets[i].write(message);
  }
}
function serverClosed() {
  for (let i = 0, count = this.sockets.length; i < count; i++) {
    let socket = this.sockets[i];
    let destroyedSocketId = false;
    if (socket) {
      if (socket.readable) {
        continue;
      }
    }
    if (socket.id) {
      destroyedSocketId = socket.id;
    }
    this.log("socket disconnected", destroyedSocketId.toString());
    if (socket && socket.destroy) {
      socket.destroy();
    }
    this.sockets.splice(i, 1);
    this.publish("socket.disconnected", socket, destroyedSocketId);
    return;
  }
}
function gotData(socket, data) {
  let sock = socket;
  if (!sock.ipcBuffer) {
    sock.ipcBuffer = "";
  }
  data = sock.ipcBuffer += data;
  if (data.slice(-1) != eventParser2.delimiter || data.indexOf(eventParser2.delimiter) == -1) {
    this.log("Messages are large, You may want to consider smaller messages.");
    return;
  }
  sock.ipcBuffer = "";
  data = eventParser2.parse(data);
  while (data.length > 0) {
    let message = new Message();
    message.load(data.shift());
    if (message.data && message.data.id) {
      sock.id = message.data.id;
    }
    this.log("received event of : ", message.type, message.data);
    this.publish(message.type, message.data, sock);
  }
}
function socketClosed(socket) {
  this.publish("close", socket);
}
function serverCreated(socket) {
  this.sockets.push(socket);
  if (socket.setEncoding) {
    socket.setEncoding(this.config.encoding);
  }
  this.log("## socket connection to server detected ##");
  socket.on("close", socketClosed.bind(this));
  socket.on("error", function(err) {
    this.log("server socket error", err);
    this.publish("error", err);
  }.bind(this));
  socket.on("data", gotData.bind(this, socket));
  this.publish("connect", socket);
}
function startServer() {
  this.log("starting server on ", this.path, this.port ? `:${this.port}` : "");
  this.server = import_net2.default.createServer(serverCreated.bind(this));
  this.server.on("error", function(err) {
    this.log("server error", err);
    this.publish("error", err);
  }.bind(this));
  this.server.maxConnections = this.config.maxConnections;
  if (!this.port) {
    this.log("starting server as", "Unix || Windows Socket");
    if (process.platform === "win32") {
      this.path = this.path.replace(/^\//, "");
      this.path = this.path.replace(/\//g, "-");
      this.path = `\\\\.\\pipe\\${this.path}`;
    }
    this.server.listen({
      path: this.path,
      readableAll: this.config.readableAll,
      writableAll: this.config.writableAll
    }, this.onStart.bind(this));
    return;
  }
}

// services/IPC.js
var import_util = __toModule(require("util"));
var IPC = class {
  constructor() {
    __publicField(this, "config", new Defaults());
    __publicField(this, "of", {});
    __publicField(this, "server", false);
  }
  get connectTo() {
    return connect2;
  }
  get connectToNet() {
    return connectNet;
  }
  get disconnect() {
    return disconnect;
  }
  get serve() {
    return serve;
  }
  get serveNet() {
    return serveNet;
  }
  get log() {
    return log;
  }
  set connectTo(value) {
    return connect2;
  }
  set connectToNet(value) {
    return connectNet;
  }
  set disconnect(value) {
    return disconnect;
  }
  set serve(value) {
    return serve;
  }
  set serveNet(value) {
    return serveNet;
  }
  set log(value) {
    return log;
  }
};
function log(...args) {
  if (this.config.silent) {
    return;
  }
  for (let i = 0, count = args.length; i < count; i++) {
    if (typeof args[i] != "object") {
      continue;
    }
    args[i] = import_util.default.inspect(args[i], {
      depth: this.config.logDepth,
      colors: this.config.logInColor
    });
  }
  this.config.logger(args.join(" "));
}
function disconnect(id) {
  if (!this.of[id]) {
    return;
  }
  this.of[id].explicitlyDisconnected = true;
  this.of[id].off("*", "*");
  if (this.of[id].socket) {
    if (this.of[id].socket.destroy) {
      this.of[id].socket.destroy();
    }
  }
  delete this.of[id];
}
function serve(path, callback) {
  if (typeof path == "function") {
    callback = path;
    path = false;
  }
  if (!path) {
    this.log("Server path not specified, so defaulting to", "ipc.config.socketRoot + ipc.config.appspace + ipc.config.id", this.config.socketRoot + this.config.appspace + this.config.id);
    path = this.config.socketRoot + this.config.appspace + this.config.id;
  }
  if (!callback) {
    callback = emptyCallback;
  }
  this.server = new Server(path, this.config, log);
  this.server.on("start", callback);
}
function emptyCallback() {
}
function connect2(id, path, callback) {
  if (typeof path == "function") {
    callback = path;
    path = false;
  }
  if (!callback) {
    callback = emptyCallback;
  }
  if (!id) {
    this.log("Service id required", "Requested service connection without specifying service id. Aborting connection attempt");
    return;
  }
  if (!path) {
    this.log("Service path not specified, so defaulting to", "ipc.config.socketRoot + ipc.config.appspace + id", (this.config.socketRoot + this.config.appspace + id).data);
    path = this.config.socketRoot + this.config.appspace + id;
  }
  if (this.of[id]) {
    if (!this.of[id].socket.destroyed) {
      this.log("Already Connected to", id, "- So executing success without connection");
      callback();
      return;
    }
    this.of[id].socket.destroy();
  }
  this.of[id] = new Client(this.config, this.log);
  this.of[id].id = id;
  this.of[id].socket ? this.of[id].socket.id = id : null;
  this.of[id].path = path;
  this.of[id].connect();
  callback(this);
}

// node-ipc-socket.js
var IPCModule = class extends IPC {
  constructor() {
    super();
    __publicField(this, "IPC", IPC);
  }
};
var singleton = new IPCModule();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  IPCModule
});
