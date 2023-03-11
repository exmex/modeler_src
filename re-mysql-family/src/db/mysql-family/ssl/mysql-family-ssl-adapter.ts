import { Ssl, SslConfig } from "re";

import { SslOptions } from "mysql2";
import fs from "fs";

export class MySQLFamilySslAdapter {
    public constructor(private _ssl: Ssl) { }

    public provide(): { ssl?: string | SslOptions } {
        const sslModel = this._ssl.provide();

        if (sslModel.ssl) {
            return {
                ssl: {
                    ...this.rejectUnauthorized(sslModel),
                    ...this.ca(sslModel),
                    ...this.cert(sslModel),
                    ...this.key(sslModel),
                    ...this.passphrase(sslModel),
                    ...this.servername(sslModel)
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

    private servername(sslModel: SslConfig) {
        return sslModel.ssl && sslModel.ssl.servername
            ? { servername: sslModel.ssl.servername }
            : {};
    }

    private ca(sslModel: SslConfig) {
        return sslModel.ssl && sslModel.ssl.ca
            ? { ca: fs.readFileSync(sslModel.ssl.ca).toString() }
            : {};
    }

    private cert(sslModel: SslConfig) {
        return sslModel.ssl && sslModel.ssl.cert
            ? { cert: fs.readFileSync(sslModel.ssl.cert).toString() }
            : {};
    }

    private key(sslModel: SslConfig) {
        return sslModel.ssl && sslModel.ssl.key
            ? { key: fs.readFileSync(sslModel.ssl.key).toString() }
            : {};
    }
}
