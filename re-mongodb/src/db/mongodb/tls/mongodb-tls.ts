export interface MongoDBTls {
    provide(): MongoDBTlsConfig;
}

export interface MongoDBTlsConfig {
    tls?: boolean;
    tlsInsecure?: boolean;
    tlsAllowInvalidCertificates?: boolean;
    tlsAllowInvalidHostnames?: boolean;
    tlsCAFile?: string;
    tlsCertificateKeyFile?: string;
    tlsCertificateKeyFilePassword?: string;
}