const ModelerAutolayout = require("al").ModelerAutolayout;

const inputFilename = process.argv[2];
const outputFilename = process.argv[3];
const layoutType = process.argv[4];
const autosize = process.argv[5];
const expandNested = process.argv[6];
const diagramId = process.argv[7];

const autolayout = new ModelerAutolayout(
  inputFilename,
  outputFilename,
  layoutType,
  autosize === "true",
  expandNested === "true",
  diagramId
);
autolayout.run();
