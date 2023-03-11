import { Category, Info, Task } from "re";

import { MongoDBFeatures } from "./MongoDBFeatures";
import { MongoDBHandledConnection } from "./MongoDBHandledConnection";

export class MongoDBConnectionTester
  implements Task<MongoDBFeatures, MongoDBHandledConnection>
{
  public getErrorCategory(error: Error): string {
    return Category.INTERNAL;
  }
  public async execute(
    connection: MongoDBHandledConnection,
    info: Info
  ): Promise<void> {
    const adminDb = connection.admin();
    const databases = (
      await adminDb.command({ listDatabases: 1, nameOnly: true })
    ).databases.map((item: { name: string }): string => item.name);

    const version = "N/A";

    console.log("Successfully connected.");
    info.reportSuccessConnect(version, databases);
  }
}
