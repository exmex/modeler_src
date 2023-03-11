import { PRODUCT, getAppName } from "common";

export const Features = {
  TLS: "tls",
  SSH: "ssh",
  MULTIDIAGRAMS: "multidiagrams",
  REPORTS: "reports",
  CONNECTIONS: "connections",
  DISABLED_CONNECTIONS: "disabled_connections",
  IMPORT_JSONSCHEMA: "import_json_schema"
};

export const isFeatureAvailable = (availableFeatures, feature, profile) => {
  return availableFeatures ? availableFeatures.includes(feature) : false;
};

export const isFreeware = (profile) => {
  return profile.appInfo.remainingDays < 1 && profile.licInfo.key === "";
};

export const isBasic = (profile) => {
  return profile.licInfo?.purchase?.short_product_id === "BrTdf";
};

export const isMeteor = (profile) => {
  return profile.appInfo.appName === getAppName(PRODUCT.METEOR_PRODUCT);
};

export const isPerseid = (profile) => {
  return profile.appInfo.appName === getAppName(PRODUCT.PERSEID_PRODUCT);
};

export const isMoon = (profile) => {
  return profile.appInfo.appName === getAppName(PRODUCT.MOON_PRODUCT);
};

export const isPro = (profile) => {
  return (
    !!profile.licInfo &&
    !!profile.licInfo.purchase &&
    profile.licInfo.purchase.short_product_id !== "BrTdf"
  );
};

export const noLicense = (profile) => {
  return profile.licInfo.key !== "";
};

export const isInvalidLicense = (licData) => {
  return (
    licData.purchase?.seller_id === undefined ||
    licData.purchase?.refunded === true ||
    licData.purchase?.email === "example@email.com" ||
    licData.key === "some key" ||
    licData.key.length < 33
  );
};
