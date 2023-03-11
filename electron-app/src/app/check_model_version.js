const compareVersions = require("compare-versions");
const { getAppTitle, getAppVersion } = require("common");
const productName = process.env.CURRENT_PRODUCT;

function checkModelVersion(storedin) {
  const modelVersion = `${storedin.major}.${storedin.minor}.${storedin.extra}`;
  const isCompatible = compareVersions.compare(
    modelVersion,
    getAppVersion(productName),
    "<="
  );
  if (!isCompatible) {
    throw new Error(
      `The project was created in a newer version of ${getAppTitle(
        productName
      )}. Download the latest version from www.datensen.com, install it and then open the project again.`
    );
  }
}

module.exports = checkModelVersion;
