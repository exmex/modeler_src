import { PRODUCT, getAppName } from "common";

export const Features = {
  JSON: "json",
  TLS: "tls",
  SSH: "ssh",
  MULTIDIAGRAMS: "multidiagrams",
  REPORTS: "reports",
  DIFF_HTML_REPORTS: "diff_html_reports",
  CONNECTIONS: "connections",
  DISABLED_CONNECTIONS: "disabled_connections",
  UPDATE: "update",
  IMPORT_FROM_FILE: "import_from_file",
  DISABLED_IMPORT_FROM_FILE: "disabled_import_from_file",
  IMPORT_FROM_URL: "import_from_url",
  FREEWARE: "freeware",
  MULTIPLE_INSTANCES: "multiple_instances",
  CONVERT: "convert"
};

export const isFeatureAvailable = (availableFeatures, feature) => {
  return availableFeatures ? availableFeatures.includes(feature) : false;
};

export const getRemainingTrialDays = (profile) => {
  return profile?.trial?.remainingTrialDays;
};

export const isExpiredApp = (profile) => {
  const nowDate = !!profile?.test?.mockNow
    ? new Date(profile?.test?.mockNow)
    : new Date();
  return new Date(profile.appInfo.lifespan) < nowDate;
};

export const isFreeware = (profile) => {
  return getRemainingTrialDays(profile) < 1 && !hasLicense(profile);
};

export const isBasicMoon = (profile) => {
  return (
    isMoon(profile) &&
    ["gjpdud", "BrTdf"].includes(profile.licInfo?.purchase?.short_product_id)
  );
};

export const isBasicLuna = (profile) => {
  const short_product_id = profile.licInfo?.purchase?.short_product_id;
  return isLuna(profile) && ["cfgtw", "BrTdf"].includes(short_product_id);
};

export const isMeteor = (profile) => {
  return profile.appInfo.appName === getAppName(PRODUCT.METEOR_PRODUCT);
};

export const isLuna = (profile) => {
  return profile.appInfo.appName === getAppName(PRODUCT.LUNA_PRODUCT);
};

export const isGalaxy = (profile) => {
  return profile.appInfo.appName === getAppName(PRODUCT.GALAXY_PRODUCT);
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
    !["gjpdud", "cfgtw", "BrTdf"].includes(
      profile.licInfo.purchase.short_product_id
    )
  );
};

export const hasLicense = (profile) => {
  return profile?.licInfo?.key !== "";
};

export const isTrial = (profile) => {
  return (
    !hasLicense(profile) &&
    getRemainingTrialDays(profile) >= 1 &&
    !isExpiredApp(profile)
  );
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
