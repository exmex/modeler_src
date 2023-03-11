const moment = require("moment");
const createHttpsProxyAgent = require("https-proxy-agent");
const axios = require("axios");
const _ = require("lodash");
const { PRODUCT } = require("common");

const urlDatensen = "https://www.datensen.com/mgm/mgmdata.php";
const urlGumroad = "https://api.gumroad.com/v2/licenses/verify/";

const bundleProProductPermalink = "MoonModeler";
const bundleBasicProductPermalink = "MoonModelerBasicEdition";
const moonProProductPermalink = "SingleMoonModeler";
const moonBasicProductPermalink = "SingleMoonModelerBasicEdition";
const galaxyProductPermalink = "GalaxyModeler";
const lunaProProductPermalink = "LunaModeler";
const lunaBasicProductPermalink = "LunaModelerBasicEdition";
const meteorProductPermalink = "MeteorModeler";
const perseidProductPermalink = "PerseidModeler";
const timeout = 5000;

class LicenseChecker {
  constructor(productName, settingsContext) {
    this.productName = productName;
    this.settingsContext = settingsContext;
  }

  getProductName() {
    return this.productName;
  }

  getSettingsContext() {
    return this.settingsContext;
  }

  async checkNewLicenses(licenseKey) {
    switch (this.getProductName()) {
      case PRODUCT.METEOR_PRODUCT:
        return await this.checkNewLicensesMeteor(licenseKey);
      case PRODUCT.PERSEID_PRODUCT:
        return await this.checkNewLicensesPerseid(licenseKey);
      case PRODUCT.LUNA_PRODUCT:
        return await this.checkNewLicensesLuna(licenseKey);
      case PRODUCT.GALAXY_PRODUCT:
        return await this.checkNewLicensesGalaxy(licenseKey);
      case PRODUCT.MOON_PRODUCT:
        return await this.checkNewLicensesMoon(licenseKey);
      default:
        return {};
    }
  }

  async checkNewLicensesMoon(licenseKey) {
    const axiosInstance = this.getAxiosInstance(
      this.getSettingsContext().getProxy()
    );

    let activeLicenseResponse = await this.checkNewLicense(
      this.buildRequest(licenseKey, moonProProductPermalink),
      axiosInstance,
      urlDatensen
    );

    if (
      activeLicenseResponse.success === false &&
      activeLicenseResponse.refunded === false
    ) {
      activeLicenseResponse = await this.checkNewLicense(
        this.buildRequest(licenseKey, moonProProductPermalink),
        axiosInstance,
        urlGumroad
      );
    }

    if (
      activeLicenseResponse.success === false &&
      activeLicenseResponse.refunded === false
    ) {
      activeLicenseResponse = await this.checkNewLicense(
        this.buildRequest(licenseKey, moonBasicProductPermalink),
        axiosInstance,
        urlDatensen
      );
    }

    if (
      activeLicenseResponse.success === false &&
      activeLicenseResponse.refunded === false
    ) {
      activeLicenseResponse = await this.checkNewLicense(
        this.buildRequest(licenseKey, moonBasicProductPermalink),
        axiosInstance,
        urlGumroad
      );
    }

    if (
      activeLicenseResponse.success === false &&
      activeLicenseResponse.refunded === false
    ) {
      activeLicenseResponse = await this.checkNewLicense(
        this.buildRequest(licenseKey, bundleProProductPermalink),
        axiosInstance,
        urlGumroad
      );
    }

    if (
      activeLicenseResponse.success === false &&
      activeLicenseResponse.refunded === false
    ) {
      activeLicenseResponse = await this.checkNewLicense(
        this.buildRequest(licenseKey, bundleBasicProductPermalink),
        axiosInstance,
        urlGumroad
      );
    }

    return this.parseActiveLicenseResponse(activeLicenseResponse, licenseKey);
  }

  async checkNewLicensesLuna(licenseKey) {
    const axiosInstance = this.getAxiosInstance(
      this.getSettingsContext().getProxy()
    );

    let activeLicenseResponse = await this.checkNewLicense(
      this.buildRequest(licenseKey, lunaProProductPermalink),
      axiosInstance,
      urlDatensen
    );

    if (
      activeLicenseResponse.success === false &&
      activeLicenseResponse.refunded === false
    ) {
      activeLicenseResponse = await this.checkNewLicense(
        this.buildRequest(licenseKey, lunaProProductPermalink),
        axiosInstance,
        urlGumroad
      );
    }

    if (
      activeLicenseResponse.success === false &&
      activeLicenseResponse.refunded === false
    ) {
      activeLicenseResponse = await this.checkNewLicense(
        this.buildRequest(licenseKey, lunaBasicProductPermalink),
        axiosInstance,
        urlDatensen
      );
    }

    if (
      activeLicenseResponse.success === false &&
      activeLicenseResponse.refunded === false
    ) {
      activeLicenseResponse = await this.checkNewLicense(
        this.buildRequest(licenseKey, lunaBasicProductPermalink),
        axiosInstance,
        urlGumroad
      );
    }

    if (
      activeLicenseResponse.success === false &&
      activeLicenseResponse.refunded === false
    ) {
      activeLicenseResponse = await this.checkNewLicense(
        this.buildRequest(licenseKey, bundleProProductPermalink),
        axiosInstance,
        urlGumroad
      );
    }

    if (
      activeLicenseResponse.success === false &&
      activeLicenseResponse.refunded === false
    ) {
      activeLicenseResponse = await this.checkNewLicense(
        this.buildRequest(licenseKey, bundleBasicProductPermalink),
        axiosInstance,
        urlGumroad
      );
    }

    return this.parseActiveLicenseResponse(activeLicenseResponse, licenseKey);
  }

  async checkNewLicensesGalaxy(licenseKey) {
    const axiosInstance = this.getAxiosInstance(
      this.getSettingsContext().getProxy()
    );

    let activeLicenseResponse = await this.checkNewLicense(
      this.buildRequest(licenseKey, galaxyProductPermalink),
      axiosInstance,
      urlDatensen
    );

    if (
      activeLicenseResponse.success === false &&
      activeLicenseResponse.refunded === false
    ) {
      activeLicenseResponse = await this.checkNewLicense(
        this.buildRequest(licenseKey, galaxyProductPermalink),
        axiosInstance,
        urlGumroad
      );
    }

    if (
      activeLicenseResponse.success === false &&
      activeLicenseResponse.refunded === false
    ) {
      activeLicenseResponse = await this.checkNewLicense(
        this.buildRequest(licenseKey, bundleProProductPermalink),
        axiosInstance,
        urlGumroad
      );
    }

    if (
      activeLicenseResponse.success === false &&
      activeLicenseResponse.refunded === false
    ) {
      activeLicenseResponse = await this.checkNewLicense(
        this.buildRequest(licenseKey, bundleBasicProductPermalink),
        axiosInstance,
        urlGumroad
      );
    }

    return this.parseActiveLicenseResponse(activeLicenseResponse, licenseKey);
  }

  parseActiveLicenseResponse(activeLicenseResponse, licenseKey) {
    if (activeLicenseResponse.success === true) {
      const license = this.buildLicense(
        licenseKey,
        activeLicenseResponse.response
      );
      return { content: license };
    } else {
      return { error: activeLicenseResponse.errorMessage };
    }
  }

  async checkNewLicensesMeteor(licenseKey) {
    const axiosInstance = this.getAxiosInstance(
      this.getSettingsContext().getProxy()
    );

    let activeLicenseResponse = await this.checkNewLicense(
      this.buildRequest(licenseKey, meteorProductPermalink),
      axiosInstance,
      urlDatensen
    );

    if (
      activeLicenseResponse.success === false &&
      activeLicenseResponse.refunded === false
    ) {
      activeLicenseResponse = await this.checkNewLicense(
        this.buildRequest(licenseKey, meteorProductPermalink),
        axiosInstance,
        urlGumroad
      );
    }

    return this.parseActiveLicenseResponse(activeLicenseResponse, licenseKey);
  }

  async checkNewLicensesPerseid(licenseKey) {
    const axiosInstance = this.getAxiosInstance(
      this.getSettingsContext().getProxy()
    );

    let activeLicenseResponse = await this.checkNewLicense(
      this.buildRequest(licenseKey, perseidProductPermalink),
      axiosInstance,
      urlDatensen
    );

    if (
      activeLicenseResponse.success === false &&
      activeLicenseResponse.refunded === false
    ) {
      activeLicenseResponse = await this.checkNewLicense(
        this.buildRequest(licenseKey, perseidProductPermalink),
        axiosInstance,
        urlGumroad
      );
    }

    return this.parseActiveLicenseResponse(activeLicenseResponse, licenseKey);
  }

  async checkNewLicense(request, axiosInstance, url) {
    try {
      const response = await axiosInstance.post(url, request, { timeout });
      return {
        response,
        success: true,
        refunded: false
      };
    } catch (error) {
      return this.processAxiosError(error);
    }
  }

  processAxiosError(error) {
    const errorMessage = _.get(error, "response.data.message");
    if (errorMessage === "This license key has been disabled.") {
      return {
        errorMessage: "Error 788: Invalid license.",
        success: false,
        refunded: true
      };
    } else if (
      errorMessage !== "That license does not exist for the provided product."
    ) {
      return {
        errorMessage: "Error 785: License cannot be validated.",
        success: false,
        refunded: false
      };
    }
    return {
      errorMessage,
      success: false,
      refunded: false
    };
  }

  getHttpsProxyAgent(proxy) {
    const usernamePassword =
      proxy.username + (proxy.password ? `:${proxy.password}` : ``);
    return {
      httpsAgent: createHttpsProxyAgent({
        host: proxy.host,
        port: proxy.port,
        auth: proxy.username ? usernamePassword : ``,
        timeout
      })
    };
  }

  getAxiosInstance(proxy) {
    const axiosInstance = axios.create(
      proxy?.enabled === true ? this.getHttpsProxyAgent(proxy) : {}
    );

    axiosInstance.defaults.timeout = 5000;
    return axiosInstance;
  }

  buildRequest(licenseKey, productPermalink) {
    return {
      product_permalink: productPermalink,
      license_key: licenseKey,
      increment_uses_count: "false"
    };
  }

  buildLicense(licenseKey, licenseResponse) {
    let stamp = new Date();
    let licData = licenseResponse.data;
    licData.key = licenseKey;
    licData.created = moment(stamp).unix();
    licData.licType = "commercial";
    return licData;
  }
}

module.exports = {
  LicenseChecker
};
