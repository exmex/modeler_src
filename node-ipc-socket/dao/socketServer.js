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

import EventParser from "../entities/EventParser.js";
import Events from "../utils/event-pubsub.js";
import Message from "../utils/message.js";
import fs from "fs";
import net from "net";

let eventParser = new EventParser();

class Server extends Events {
  constructor(path, config, log, port) {
    super();
    this.config = config;
    this.path = path;
    this.port = port;
    this.log = log;

    this.publish = super.emit;

    eventParser = new EventParser(this.config);

    this.on("close", serverClosed.bind(this));
  }

  server = false;
  sockets = [];
  emit = emit;
  broadcast = broadcast;

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
      fs.unlink(this.path, startServer.bind(this));
    } else {
      startServer.bind(this)();
    }
  }
}

function emit(socket, type, data) {
  this.log("dispatching event to socket", " : ", type, data);

  let message = new Message();
  message.type = type;
  message.data = data;

  this.log(this.config.encoding);
  message = eventParser.format(message);

  socket.write(message);
}

function broadcast(type, data) {
  this.log(
    "broadcasting event to all known sockets listening to ",
    this.path,
    " : ",
    this.port ? this.port : "",
    type,
    data
  );
  let message = new Message();
  message.type = type;
  message.data = data;

  message = eventParser.format(message);

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

  if (
    data.slice(-1) != eventParser.delimiter ||
    data.indexOf(eventParser.delimiter) == -1
  ) {
    this.log("Messages are large, You may want to consider smaller messages.");
    return;
  }

  sock.ipcBuffer = "";

  data = eventParser.parse(data);

  while (data.length > 0) {
    let message = new Message();
    message.load(data.shift());

    // Only set the sock id if it is specified.
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

  socket.on(
    "error",
    function (err) {
      this.log("server socket error", err);

      this.publish("error", err);
    }.bind(this)
  );

  socket.on("data", gotData.bind(this, socket));

  this.publish("connect", socket);
}

function startServer() {
  this.log("starting server on ", this.path, this.port ? `:${this.port}` : "");

  this.server = net.createServer(serverCreated.bind(this));

  this.server.on(
    "error",
    function (err) {
      this.log("server error", err);

      this.publish("error", err);
    }.bind(this)
  );

  this.server.maxConnections = this.config.maxConnections;

  if (!this.port) {
    this.log("starting server as", "Unix || Windows Socket");
    if (process.platform === "win32") {
      this.path = this.path.replace(/^\//, "");
      this.path = this.path.replace(/\//g, "-");
      this.path = `\\\\.\\pipe\\${this.path}`;
    }

    this.server.listen(
      {
        path: this.path,
        readableAll: this.config.readableAll,
        writableAll: this.config.writableAll,
      },
      this.onStart.bind(this)
    );

    return;
  }
}

export { Server as default, Server };
