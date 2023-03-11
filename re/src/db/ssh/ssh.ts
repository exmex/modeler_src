export interface SshParameters {
    host?: string, port?: number, username?: string, password?: string, privateKey?: string, passphrase?: string
}

export interface Ssh {
    provide(): Promise<SshParameters>
}