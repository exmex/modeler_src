import { Info } from "./Info";
import { MessagePrettier } from "./MessagePrettier";
import fs from "fs";
import path from "path";

export class StoredInfo implements Info {
  private filename: string;
  private started: number;
  private messagePrettier: MessagePrettier;

  public constructor(filename: string, messagePrettier: MessagePrettier) {
    this.filename = filename;
    this.started = new Date().getTime();
    this.messagePrettier = messagePrettier;
  }

  public reportSuccessConnect(version: string, databases: string[]): void {
    const success = {
      databases,
      message: "",
      started: this.started,
      status: "ok",
      version
    };

    this.store(success);
  }

  public reportSuccess(): void {
    const success = {
      message: "",
      started: this.started,
      status: "ok"
    };

    this.store(success);
  }

  public reportError(error: Error, category: string): void {
    const fail = {
      message: this.messagePrettier.pretty(error.message),
      stack: error.stack,
      started: this.started,
      status: "error",
      category
    };
    this.store(fail);
  }

  private checkDirectorySync(directory: string): void {
    try {
      fs.statSync(directory);
    } catch (e) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }

  private store(data: object): void {
    this.checkDirectorySync(path.dirname(this.filename));
    fs.writeFileSync(this.filename, JSON.stringify(data, null, "\t"));
  }
}
