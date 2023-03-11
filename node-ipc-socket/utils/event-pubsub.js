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

class EventPubSub {
  constructor() {}

  on(type, handler, once = false) {
    if (type == "*") {
      type = this.#all;
    }

    if (!this.#events[type]) {
      this.#events[type] = [];
    }

    handler[this.#once] = once;

    this.#events[type].push(handler);

    return this;
  }

  once(type, handler) {
    //sugar for this.on with once set to true
    //so let that do the validation
    return this.on(type, handler, true);
  }

  off(type = "*", handler = "*") {
    if (type == this.#all.toString() || type == "*") {
      type = this.#all;
    }

    if (!this.#events[type]) {
      return this;
    }

    if (handler == "*") {
      delete this.#events[type];
      return this;
    }

    //If we are not removing all the handlers,
    //we need to know which one we are removing.

    const handlers = this.#events[type];

    while (handlers.includes(handler)) {
      handlers.splice(handlers.indexOf(handler), 1);
    }

    if (handlers.length < 1) {
      delete this.#events[type];
    }

    return this;
  }

  emit(type, ...args) {
    const globalHandlers = this.#events[this.#all] || [];

    this.#handleOnce(this.#all.toString(), globalHandlers, type, ...args);

    if (!this.#events[type]) {
      return this;
    }

    const handlers = this.#events[type];

    this.#handleOnce(type, handlers, ...args);

    return this;
  }

  reset() {
    this.off(this.#all.toString());
    for (let type in this.#events) {
      this.off(type);
    }

    return this;
  }

  get list() {
    return Object.assign({}, this.#events);
  }

  #handleOnce = (type, handlers, ...args) => {
    const deleteOnceHandled = [];

    for (let handler of handlers) {
      handler(...args);
      if (handler[this.#once]) {
        deleteOnceHandled.push(handler);
      }
    }

    for (let handler of deleteOnceHandled) {
      this.off(type, handler);
    }
  };

  #all = Symbol.for("event-pubsub-all");
  #once = Symbol.for("event-pubsub-once");

  #events = {};
}

export { EventPubSub as default, EventPubSub };
