/*
MIT License

Copyright (c) 2020 Brandon Nozaki Miller

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import Client from "../dao/client.js";
import Defaults from "../entities/Defaults.js";
import Server from "../dao/socketServer.js";
import util from "util";

class IPC {
  constructor() {}

  //public members
  config = new Defaults();
  of = {};
  server = false;

  //protected methods
  get connectTo() {
    return connect;
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
    return connect;
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
}

function log(...args) {
  if (this.config.silent) {
    return;
  }

  for (let i = 0, count = args.length; i < count; i++) {
    if (typeof args[i] != "object") {
      continue;
    }

    args[i] = util.inspect(args[i], {
      depth: this.config.logDepth,
      colors: this.config.logInColor,
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
    this.log(
      "Server path not specified, so defaulting to",
      "ipc.config.socketRoot + ipc.config.appspace + ipc.config.id",
      this.config.socketRoot + this.config.appspace + this.config.id
    );
    path = this.config.socketRoot + this.config.appspace + this.config.id;
  }

  if (!callback) {
    callback = emptyCallback;
  }

  this.server = new Server(path, this.config, log);

  this.server.on("start", callback);
}

function emptyCallback() {
  //Do Nothing
}

function connect(id, path, callback) {
  if (typeof path == "function") {
    callback = path;
    path = false;
  }

  if (!callback) {
    callback = emptyCallback;
  }

  if (!id) {
    this.log(
      "Service id required",
      "Requested service connection without specifying service id. Aborting connection attempt"
    );
    return;
  }

  if (!path) {
    this.log(
      "Service path not specified, so defaulting to",
      "ipc.config.socketRoot + ipc.config.appspace + id",
      (this.config.socketRoot + this.config.appspace + id).data
    );
    path = this.config.socketRoot + this.config.appspace + id;
  }

  if (this.of[id]) {
    if (!this.of[id].socket.destroyed) {
      this.log(
        "Already Connected to",
        id,
        "- So executing success without connection"
      );
      callback();
      return;
    }
    this.of[id].socket.destroy();
  }

  this.of[id] = new Client(this.config, this.log);
  this.of[id].id = id;
  this.of[id].socket ? (this.of[id].socket.id = id) : null;
  this.of[id].path = path;

  this.of[id].connect();

  callback(this);
}

export { IPC as default, IPC };
