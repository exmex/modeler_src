const { SQLiteReverseEngineering } = require("re-sqlite");
const source = process.argv[2];
const outputFilename = process.argv[3];
const infoFilename = process.argv[4];
const originalModelFile = process.argv[5];
const connectionId = process.argv[6];
const connectionName = process.argv[7];

(async () => {
  const reverseEngineering = new SQLiteReverseEngineering(
    connectionId,
    connectionName,
    source,
    outputFilename,
    1000,
    true,
    infoFilename,
    originalModelFile
  );
  reverseEngineering.run();
})();
