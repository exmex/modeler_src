require("dotenv").config();

const builder = require("electron-builder");
console.log(__dirname);
console.log({ cp: process.env.CURRENT_PRODUCT });
const productName = process.env.CURRENT_PRODUCT;
const { getAppId, getAppTitle, getAppVersion } = require("common");

const SIGNTOOL_PATH = process.env.SIGNTOOL_PATH;
const APPLE_NOTARIZATION_INITIALIZED =
  !!process.env.APPLEID && !!process.env.APPLEIDPASS;

const config = {
  appId: getAppId(productName),
  productName: getAppTitle(productName),
  extraMetadata: { version: getAppVersion(productName) },
  artifactName: `${getAppTitle(productName)}-${getAppVersion(
    productName
  )}-\${arch}.\${ext}`,
  icon: "build/icons/",
  target: "nsis",
  extraResources: [
    {
      from: "build/styles/",
      to: "build/styles/",
      filter: ["**/*"],
    },
  ],
  files: ["**/*", "!test/*", "!build_scripts", "!dist*", "!.*"],
  extends: null,
  directories: {
    buildResources: "assets",
    output: `dist`,
  },
  dmg: {
    sign: false,
    title: `${getAppTitle(productName)}-${getAppVersion(productName)}`,
  },
  win: {
    ...(SIGNTOOL_PATH ? { sign: "./build_scripts/sign.js" } : {}),
    target: "nsis",
    icon: "build/favicon.ico",
  },
  mac: {
    icon: "build/icons/icon.icns",
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: "build/entitlements.mac.plist",
    entitlementsInherit: "build/entitlements.mac.plist",
    target: {
      target: "default",
      arch: ["x64"],
    },
  },
  linux: {
    target: "AppImage",
    icon: "build/icons/",
    category: "Development",
  },
  appImage: {
    license: "build/license.txt",
  },
  nsis: {
    oneClick: false,
    license: "build/license.txt",
  },
  ...(APPLE_NOTARIZATION_INITIALIZED
    ? { afterSign: "build_scripts/notarize.js" }
    : {}),
};

console.log(config);

builder.build({ config });
