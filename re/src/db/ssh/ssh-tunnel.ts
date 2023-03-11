import { ConnectionProvider } from "../../task/ConnectionProvider";
import { Features } from "../../reverse/common/Features";
import { ForwardedUrlBuilder } from "../ForwardedUrlBuilder";
import { HandledConnection } from "../HandledConnection";
import { Server } from "net";
import { Ssh } from "./ssh";
import { URL } from "url";
import tunnel from "tunnel-ssh";

import getPort from "get-port";

export class SshTunnel<U extends Features, T extends HandledConnection<U>> {
  private serverError?: Error;

  public constructor(
    private forwardedUrlBuilder: ForwardedUrlBuilder,
    private url: URL,
    private ssh: Ssh,
    private createDirectConnectionProvider: (
      sshTunneledServer: string
    ) => ConnectionProvider<U, T>,
    private createSShConnectionProvider: (
      handledConnection: T,
      server: Server
    ) => T
  ) {}

  public async createConnection(hint: string): Promise<T> {
    const availablePort = await getPort();

    const sshParams = await this.ssh.provide();
    const config: tunnel.Config = {
      ...sshParams,
      dstHost: this.url.hostname,
      dstPort: +this.url.port,
      localPort: availablePort,
      keepAlive: true,
      debug: (info) => console.log(info)
    };

    const server = await this.createServer(config);
    try {
      const forwardedUrl = this.forwardedUrlBuilder.build(
        `${this.url.protocol}//localhost:${availablePort}`,
        this.url.searchParams
      );
      const provider = this.createDirectConnectionProvider(forwardedUrl);

      console.log(
        `Connecting to ${this.url.toString()}\n` +
          `using ssh: ${sshParams.username}@${sshParams.host}:${sshParams.port}\n` +
          `${sshParams.privateKey ? `with private key\n` : ``}` +
          `${sshParams.passphrase ? `with passphrase\n` : ``}` +
          `using local address: ${forwardedUrl}`
      );
      const innerConnection = await provider.createConnection(hint);
      return this.createSShConnectionProvider(innerConnection, server);
    } catch (err) {
      server.close();
      if (this.serverError) {
        const errorToThrow = this.serverError;
        this.serverError = undefined;
        throw errorToThrow;
      }
      throw err;
    }
  }

  private async createServer(config: tunnel.Config): Promise<Server> {
    const server = await new Promise<Server>((resolve, error): void => {
      tunnel(config, (tunnelError, tunnelServer): void => {
        if (tunnelError) {
          error(tunnelError);
          return;
        }
        resolve(tunnelServer);
      });
    });

    server.on("error", (err): void => {
      this.serverError = err;
    });

    return server;
  }
}
