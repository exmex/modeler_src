require("dotenv").config();
const productName = process.env.CURRENT_PRODUCT;

const { notarize } = require("electron-notarize");

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== "darwin") {
    return;
  }
  const { getAppId } = require("common");
  const appName = context.packager.appInfo.productFilename;

  console.log({
    appBundleId: getAppId(productName),
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS,
  });

  return notarize({
    tool: "notarytool",
    appBundleId: getAppId(productName),
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS,
    teamId: process.env.APPLETEAMID
  });
};
