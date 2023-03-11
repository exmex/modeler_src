import { Ssl, SslConfig } from "re";

import fs from "fs";
import tls from "tls";

export class MariaDBFamilySslAdapter {
    public constructor(private _ssl: Ssl) { }

    public provide(): { ssl?: boolean | (tls.SecureContextOptions & { rejectUnauthorized?: boolean }) } {
        const sslModel = this._ssl.provide();

        if (sslModel.ssl) {
            return {
                ssl: {
                    ...this.rejectUnauthorized(sslModel),
                    ...this.ca(sslModel),
                    ...this.cert(sslModel),
                    ...this.key(sslModel),
                    ...this.passphrase(sslModel)
                }
            }
        }

        return {};
    }

    private rejectUnauthorized(sslModel: SslConfig) {
        return sslModel.ssl
            && (sslModel.ssl.rejectUnauthorized === false
                || sslModel.ssl.rejectUnauthorized === true)
            ? { rejectUnauthorized: sslModel.ssl.rejectUnauthorized }
            : {};
    }

    private passphrase(sslModel: SslConfig) {
        return sslModel.ssl && sslModel.ssl.passphrase
            ? { passphrase: sslModel.ssl.passphrase }
            : {};
    }

    private ca(sslModel: SslConfig) {
        return sslModel.ssl && sslModel.ssl.ca
            ? { ca: fs.readFileSync(sslModel.ssl.ca) }
            : {};
    }

    private cert(sslModel: SslConfig) {
        return sslModel.ssl && sslModel.ssl.cert
            ? { cert: fs.readFileSync(sslModel.ssl.cert) }
            : {};
    }

    private key(sslModel: SslConfig) {
        return sslModel.ssl && sslModel.ssl.passphrase
            ? { key: fs.readFileSync(sslModel.ssl.passphrase) }
            : {};
    }
}
