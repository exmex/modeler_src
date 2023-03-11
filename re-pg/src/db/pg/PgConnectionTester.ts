import { Category, Info, SQLHandledConnection, Task } from "re";

import { PgFeatures } from "../../reverse/pg/PgFeatures";

export class PgConnectionTester
  implements Task<PgFeatures, SQLHandledConnection<PgFeatures>>
{
  public getErrorCategory(error: Error): string {
    return Category.INTERNAL;
  }

  public async execute(
    connection: SQLHandledConnection<PgFeatures>,
    info: Info
  ): Promise<void> {
    try {
      const result = (await connection.query(`show server_version`))
        .rows[0] as { server_version: string };

      const version = result.server_version.split(" ")[0];

      const databases = (
        await connection.query(
          `select\n` +
            ` nspname\n` +
            `from\n` +
            ` pg_namespace\n` +
            `where\n` +
            ` nspname not in (\n` +
            `     'information_schema',\n` +
            `     'pg_toast',\n` +
            `     'pg_catalog')\n`
        )
      ).rows.map((row: { nspname: string }): string => row.nspname);

      console.log("Successfully connected.");
      info.reportSuccessConnect(version, databases);
    } catch (error) {
      info.reportError(error, Category.CONNECTION);
    }
  }
}
