import { KnownIdRegistry } from "re";
import { TableMetadata } from "../../../metadata/TableMetadata";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";

interface TableMetadataBuilderRow {
  TABLE_NAME: string;
  TABLE_COMMENT: string;
  TABLE_COLLATION: string;
  CHARACTER_SET_NAME: string;
  ROW_FORMAT: string;
  ENGINE: string;
  AUTO_INCREMENT: string;
}

export class TableMetadataBuilder {
  public constructor(
    private result: TableMetadataBuilderRow[],
    private tablesMetadata: Map<string, TableMetadata>,
    private database: string,
    private knownIdRegistry: KnownIdRegistry
  ) {}

  public transform(): void {
    this.result.forEach((row: TableMetadataBuilderRow): void => {
      const schema = this.database;
      const name = row.TABLE_NAME;
      const type = undefined as any;
      const originalTable = this.knownIdRegistry.getTable(schema, name, type);
      const id = originalTable?.id ?? uuidv4();

      const tableMetadata = new TableMetadata(
        id,
        row.TABLE_NAME,
        false,
        originalTable?.estimatedSize ?? "",
        originalTable?.visible ?? true,
        this.database,
        row.TABLE_COMMENT,
        row.TABLE_COLLATION,
        row.CHARACTER_SET_NAME,
        row.ROW_FORMAT,
        row.ENGINE,
        row.AUTO_INCREMENT,
        ""
      );
      this.tablesMetadata.set(tableMetadata.name, tableMetadata);
    });
  }
}
