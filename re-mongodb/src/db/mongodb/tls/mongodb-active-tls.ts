import { MongoDBTls, MongoDBTlsConfig } from "./mongodb-tls";

export class MongoDBActiveTls implements MongoDBTls {
    public constructor(
        private _tlsInsecure?: boolean,
        private _tlsAllowInvalidCertificates?: boolean,
        private _tlsAllowInvalidHostnames?: boolean,
        private _tlsCAFile?: string,
        private _tlsCertificateKeyFile?: string,
        private _tlsCertificateKeyFilePassword?: string,
    ) { }

    public provide(): MongoDBTlsConfig {
        return {
            tls: true,
            tlsInsecure: this._tlsInsecure,
            tlsAllowInvalidCertificates: this._tlsAllowInvalidCertificates,
            tlsAllowInvalidHostnames: this._tlsAllowInvalidHostnames,
            tlsCAFile: this._tlsCAFile,
            tlsCertificateKeyFile: this._tlsCertificateKeyFile,
            tlsCertificateKeyFilePassword: this._tlsCertificateKeyFilePassword
        }
    }
}