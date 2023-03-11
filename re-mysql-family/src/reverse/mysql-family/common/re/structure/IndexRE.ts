import { KnownIdRegistry, QueryExecutor } from "re";

import { IndexMetadataBuilder } from "./builder/IndexMetadataBuilder";
import { TableMetadata } from "../../metadata/TableMetadata";

const INDEX_QUERY =
  `SELECT\n` +
  `STATISTICS.COLUMN_NAME,\n` +
  `STATISTICS.INDEX_NAME,\n` +
  `STATISTICS.TABLE_NAME,\n` +
  `STATISTICS.INDEX_TYPE,\n` +
  `STATISTICS.NON_UNIQUE\n` +
  `FROM INFORMATION_SCHEMA.STATISTICS\n` +
  `WHERE STATISTICS.TABLE_SCHEMA = ?\n` +
  `AND STATISTICS.INDEX_SCHEMA = ?\n` +
  `AND STATISTICS.NON_UNIQUE = 1`;
export class IndexRE {
  public constructor(
    private queryExecutor: QueryExecutor,
    private schema: string,
    private indexMetadataBuilder: IndexMetadataBuilder
  ) {}

  public async reverse(
    tablesMetadata: Map<string, TableMetadata>
  ): Promise<void> {
    const result = await this.queryExecutor.query(INDEX_QUERY, [
      this.schema,
      this.schema
    ]);
    this.indexMetadataBuilder.transform(result, tablesMetadata);
  }
}
