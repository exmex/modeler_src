export interface Ssl {
    provide(): SslConfig;
}

export interface SslConfig {
    ssl?: {
        rejectUnauthorized?: boolean;
        ca?: string;
        cert?: string;
        key?: string;
        passphrase?: string;
        servername?: string;
    }
}