import { Category, Info, SQLHandledConnection, Task } from "re";

import { MySQLFamilyFeatures } from "../../reverse/mysql-family/common/MySQLFamilyFeatures";

export class MySQLFamilyDBConnectionTester
  implements
    Task<MySQLFamilyFeatures, SQLHandledConnection<MySQLFamilyFeatures>>
{
  public getErrorCategory(error: Error): string {
    return Category.INTERNAL;
  }

  public async execute(
    connection: SQLHandledConnection<MySQLFamilyFeatures>,
    info: Info
  ): Promise<void> {
    try {
      const version = (await connection.getServerVersion()).split("-")[0];
      const databases = (await connection.query(`show schemas`)).map(
        (item: { Database: string }): string => {
          return item.Database;
        }
      );

      console.log("Successfully connected.");
      info.reportSuccessConnect(version, databases);
    } catch (error) {
      info.reportError(error, Category.CONNECTION);
    }
  }
}
