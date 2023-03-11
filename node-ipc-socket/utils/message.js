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

function Message() {
  Object.defineProperties(this, {
    data: {
      enumerable: true,
      get: getData,
      set: setData,
    },
    type: {
      enumerable: true,
      get: getType,
      set: setType,
    },
    load: {
      enumerable: true,
      writable: false,
      value: parse,
    },
    JSON: {
      enumerable: true,
      get: getJSON,
    },
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
      type: type,
      data: data,
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
      (type = "error"),
        (data = {
          message: "Invalid JSON response format",
          err: err,
          response: badMessage,
        });
    }
  }
}

export { Message as default, Message };
