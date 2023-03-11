import { Ssh } from "./ssh";
import fs from "fs";

export class ActiveSsh implements Ssh {
  constructor(
    public host: string,
    public port: number,
    public username: string,
    public password: string,
    public privateKey: string,
    public passphrase: string
  ) { }

  private async getKey() {
    if (!this.privateKey) {
      return Promise.resolve("");
    }
    try {
      return (await fs.promises.readFile(this.privateKey)).toString();
    } catch (error) {
      throw new Error(`Private Key file ${this.privateKey} cannot be loaded.`)
    }
  }

  public async provide() {
    return {
      host: this.host,
      port: this.port,
      username: this.username,
      password: this.password,
      privateKey: await this.getKey(),
      passphrase: this.passphrase,
    };
  }
}
