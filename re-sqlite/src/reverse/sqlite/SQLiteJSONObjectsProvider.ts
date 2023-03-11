import { JSONObjects, JSONObjectsProvider, JSONTableColumn } from "re-json";

import { SQLiteHandledConnection } from "../../db/sqlite/sqlite-handled-connection";
import { SQLiteQuotation } from "../../db/sqlite/sqlite-quotation";

export class SQLiteJSONObjectsProvider implements JSONObjectsProvider {
  public constructor(
    private connection: SQLiteHandledConnection,
    private limit: number,
    private quotation: SQLiteQuotation
  ) {
    this.connection = connection;
    this.limit = limit;
    this.quotation = quotation;
  }

  public async get(jsonColumn: JSONTableColumn): Promise<JSONObjects[]> {
    return [];
    // const query = `SELECT ${this.quotation.quoteIdentifier(jsonColumn.column.name)}\n`
    //     + `FROM ${this.quotation.quoteIdentifier(jsonColumn.tablename)} ${this.evalLimit()}`;
    // return this.connection.query(query);
  }

  private evalLimit(): string {
    return this.limit > 0 ? `limit ${this.limit}` : ``;
  }
}
