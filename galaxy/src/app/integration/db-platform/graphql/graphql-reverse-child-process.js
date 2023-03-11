const { GraphQLReverseEngineering } = require("re-graphql");

const sourceType = process.argv[2];
const source = process.argv[3];
const outputFilename = process.argv[4];
const infoFilename = process.argv[5];

(async () => {
  const reverseEngineering = new GraphQLReverseEngineering(
    "",
    "GraphQL",
    sourceType,
    source,
    outputFilename,
    true,
    infoFilename
  );
  reverseEngineering.run();
})();
