import { JSONObjects, JSONObjectsProvider, JSONTableColumn } from "re-json";

import { PgFeatures } from "./PgFeatures";
import { PgQuotation } from "../../db/pg/pg-quotation";
import { SQLHandledConnection } from "re";

export class PgJSONObjectsProvider implements JSONObjectsProvider {
  private client: SQLHandledConnection<PgFeatures>;
  private schema: string;
  private limit: number;
  quotation: PgQuotation;

  public constructor(
    client: SQLHandledConnection<PgFeatures>,
    schema: string,
    limit: number,
    quotation: PgQuotation
  ) {
    this.client = client;
    this.schema = schema;
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
