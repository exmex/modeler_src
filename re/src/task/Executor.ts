import { Category, Task } from "./Task";

import { ConnectionProvider } from "./ConnectionProvider";
import { Features } from "../reverse/common/Features";
import { HandledConnection } from "../db/HandledConnection";
import { Info } from "../info/Info";

export class Executor<U extends Features, T extends HandledConnection<U>> {
  private info: Info;
  private provider: ConnectionProvider<U, T>;
  private task: Task<U, T>;

  public constructor(
    info: Info,
    provider: ConnectionProvider<U, T>,
    task: Task<U, T>
  ) {
    this.info = info;
    this.provider = provider;
    this.task = task;
  }

  public async execute(): Promise<void> {
    try {
      const connection = await this.provider.createConnection("execute");
      try {
        try {
          await this.task.execute(connection, this.info);
        } catch (error) {
          this.info.reportError(error, this.task.getErrorCategory(error));
        }
      } finally {
        await connection.close();
      }
    } catch (error) {
      this.info.reportError(error, Category.CONNECTION);
    }
  }
}
