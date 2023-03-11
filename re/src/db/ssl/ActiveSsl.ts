import { Ssl, SslConfig } from "./Ssl";

export class ActiveSsl implements Ssl {
    public constructor(
        private _rejectUnauthorized?: boolean,
        private _ca?: string,
        private _cert?: string,
        private _key?: string,
        private _passphrase?: string,
        private _servername?: string) { }

    public provide(): SslConfig {
        return {
            ssl: {
                rejectUnauthorized: this._rejectUnauthorized,
                ca: this._ca,
                cert: this._cert,
                key: this._key,
                passphrase: this._passphrase,
                servername: this._servername
            }
        }
    }
}
