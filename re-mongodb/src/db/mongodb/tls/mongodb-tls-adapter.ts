import { MongoDBTls, MongoDBTlsConfig } from "./mongodb-tls";

import { MongoClientOptions } from "mongodb";

export class MongoDBTlsAdapter {
  public constructor(private _mongoDBTls: MongoDBTls) {}

  public provide(): MongoClientOptions {
    const tlsModel = this._mongoDBTls.provide();
    if (tlsModel.tls) {
      return {
        ...this.tls(tlsModel),
        ...this.tlsInsecure(tlsModel),
        ...this.tlsAllowInvalidCertificates(tlsModel),
        ...this.tlsAllowInvalidHostnames(tlsModel),
        ...this.tlsCAFile(tlsModel),
        ...this.tlsCertificateKeyFile(tlsModel),
        ...this.tlsCertificateKeyFilePassword(tlsModel)
      };
    }

    return {};
  }

  private tls(sslModel: MongoDBTlsConfig) {
    return sslModel.tls === false || sslModel.tls === true
      ? { tls: sslModel.tls }
      : {};
  }

  private tlsInsecure(sslModel: MongoDBTlsConfig) {
    return sslModel.tlsInsecure === false || sslModel.tlsInsecure === true
      ? { tlsInsecure: sslModel.tlsInsecure }
      : {};
  }

  private tlsAllowInvalidCertificates(sslModel: MongoDBTlsConfig) {
    return sslModel.tlsAllowInvalidCertificates === false ||
      sslModel.tlsAllowInvalidCertificates === true
      ? { tlsAllowInvalidCertificates: sslModel.tlsAllowInvalidCertificates }
      : {};
  }

  private tlsAllowInvalidHostnames(sslModel: MongoDBTlsConfig) {
    return sslModel.tlsAllowInvalidHostnames === false ||
      sslModel.tlsAllowInvalidHostnames === true
      ? { tlsAllowInvalidHostnames: sslModel.tlsAllowInvalidHostnames }
      : {};
  }

  private tlsCAFile(sslModel: MongoDBTlsConfig) {
    return sslModel.tlsCAFile ? { tlsCAFile: sslModel.tlsCAFile } : {};
  }

  private tlsCertificateKeyFile(sslModel: MongoDBTlsConfig) {
    return sslModel.tlsCertificateKeyFile
      ? { tlsCertificateKeyFile: sslModel.tlsCertificateKeyFile }
      : {};
  }
  private tlsCertificateKeyFilePassword(sslModel: MongoDBTlsConfig) {
    return sslModel.tlsCertificateKeyFilePassword
      ? {
          tlsCertificateKeyFilePassword: sslModel.tlsCertificateKeyFilePassword
        }
      : {};
  }
}
