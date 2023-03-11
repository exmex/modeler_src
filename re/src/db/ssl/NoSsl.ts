import { Ssl, SslConfig } from "./Ssl";

export class NoSsl implements Ssl {
    public provide(): SslConfig {
        return {};
    }
}