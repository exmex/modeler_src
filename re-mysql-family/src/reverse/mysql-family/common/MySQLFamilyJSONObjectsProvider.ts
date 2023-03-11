import { JSONObjects, JSONObjectsProvider, JSONTableColumn } from "re-json";

import { QueryExecutor } from "re";

export class MySQLFamilyJSONObjectsProvider implements JSONObjectsProvider {
  public constructor(
    private queryExecutor: QueryExecutor,
    private schema: string,
    private limit: number
  ) {}

  public async get(jsonColumn: JSONTableColumn): Promise<JSONObjects[]> {
    return [];
    //         const query = `SELECT \`${jsonColumn.column.name}\`
    // FROM \`${this.schema}\`.\`${jsonColumn.tablename}\` ${this.evalLimit()}`;
    //         return await this.queryExecutor.query(query);
  }

  private evalLimit(): string {
    return this.limit > 0 ? `limit ${this.limit}` : ``;
  }
}
