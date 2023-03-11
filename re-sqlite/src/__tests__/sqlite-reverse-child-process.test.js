const child_process = require("child_process");
const path = require("path");

it("should exist the sqlite-reverse-child-process script", done => {
  const childProcess = child_process.fork(
    path.join(__dirname, "../sqlite-reverse-child-process.js"),
    [],
    { silent: true }
  );
  childProcess.once("close", () => {
    done();
  });
});
