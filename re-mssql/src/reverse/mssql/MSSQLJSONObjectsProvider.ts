import { JSONObjects, JSONObjectsProvider, JSONTableColumn } from "re-json";

import { MSSQLFeatures } from "./MSSQLFeatures";
import { MSSQLQuotation } from "../../db/mssql/mssql-quotation";
import { SQLHandledConnection } from "re";

export class MSSQLJSONObjectsProvider implements JSONObjectsProvider {
  private client: SQLHandledConnection<MSSQLFeatures>;
  private limit: number;
  quotation: MSSQLQuotation;

  public constructor(
    client: SQLHandledConnection<MSSQLFeatures>,
    limit: number,
    quotation: MSSQLQuotation
  ) {
    this.client = client;
    this.limit = limit;
    this.quotation = quotation;
  }

  public async get(jsonColumn: JSONTableColumn): Promise<JSONObjects[]> {
    return [];
    // const columnName = this.quotation.quoteIdentifier(jsonColumn.column.name);
    // const schema = this.quotation.quoteIdentifier(this.schema);
    // const table = this.quotation.quoteIdentifier(jsonColumn.tablename);
    // const query = `SELECT ${columnName} FROM ${schema}.${table} ${this.evalLimit()}`;
    // try {
    //   const result = await this.client.query(query);
    //   return result.rows;
    // } catch (e: any) {
    //   if (e.message && e.message.startsWith("permission denied")) {
    //     return [];
    //   }
    //   throw e;
    // }
  }

  private evalLimit(): string {
    return this.limit > 0 ? `limit ${this.limit}` : ``;
  }
}
