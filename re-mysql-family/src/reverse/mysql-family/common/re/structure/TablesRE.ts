import { KnownIdRegistry, QueryExecutor } from "re";

import { TableMetadata } from "../../metadata/TableMetadata";
import { TableMetadataBuilder } from "./builder/TableMetadataBuilder";
import { kMaxLength } from "buffer";

const QUERY =
  `SELECT\n` +
  `t.TABLE_NAME,\n` +
  `t.TABLE_COMMENT,\n` +
  `t.TABLE_COLLATION,\n` +
  `t.ROW_FORMAT,\n` +
  `t.ENGINE,\n` +
  `t.AUTO_INCREMENT,\n` +
  `c.CHARACTER_SET_NAME\n` +
  `FROM information_schema.tables t\n` +
  `LEFT JOIN information_schema.collations c\n` +
  `    ON t.TABLE_COLLATION = c.COLLATION_NAME\n` +
  `WHERE t.TABLE_TYPE = 'BASE TABLE' AND t.TABLE_SCHEMA = ?\n`;
export class TablesRE {
  public constructor(
    private queryExecutor: QueryExecutor,
    private schema: string,
    private knownIdRegistry: KnownIdRegistry
  ) {}

  public async reverse(
    tablesMetadata: Map<string, TableMetadata>
  ): Promise<void> {
    const result = await this.queryExecutor.query(QUERY, [this.schema]);

    const builder = new TableMetadataBuilder(
      result,
      tablesMetadata,
      this.schema,
      this.knownIdRegistry
    );
    builder.transform();
  }
}
