import { Category, Info, SQLHandledConnection, Task } from "re";

import { MSSQLFeatures } from "../../reverse/mssql/MSSQLFeatures";

export class MSSQLConnectionTester
  implements Task<MSSQLFeatures, SQLHandledConnection<MSSQLFeatures>>
{
  public getErrorCategory(error: Error): string {
    return Category.INTERNAL;
  }

  public async execute(
    connection: SQLHandledConnection<MSSQLFeatures>,
    info: Info
  ): Promise<void> {
    try {
      // const result = (await connection.query(`show server_version`))
      //   .rows[0] as { server_version: string };

      const version = "16";

      const databases = (
        await connection.query(
          `SELECT name _schema FROM sys.databases ORDER BY 1`
        )
      ).map((row: { _schema: string }): string => row._schema);

      console.log("Successfully connected.");
      info.reportSuccessConnect(version, databases);
    } catch (error) {
      info.reportError(error, Category.CONNECTION);
    }
  }
}
