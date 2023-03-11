import { CommonColumnReferenceMetadata, KnownIdRegistry } from "re";

import { IndexMetadata } from "../../../metadata/IndexMetadata";
import { TableMetadata } from "../../../metadata/TableMetadata";

interface IndexMetadataRow {
  TABLE_NAME: string;
  INDEX_NAME: string;
  COLUMN_NAME: string;
  NON_UNIQUE: number;
  INDEX_TYPE: string;
}

export class IndexMetadataBuilder {
  public constructor(private knownIdRegistry: KnownIdRegistry) {}

  public transform(
    result: IndexMetadataRow[],
    tablesMetadata: Map<string, TableMetadata>
  ): void {
    result.forEach((row: IndexMetadataRow): void => {
      const tableMetadata = tablesMetadata.get(row.TABLE_NAME);
      let index = tableMetadata.indexes.get(row.INDEX_NAME);
      if (!index) {
        index = this.createIndex(tableMetadata, row);
      }
      const column = tableMetadata.columns.find(
        (col) => col.name === row.COLUMN_NAME
      );
      if (column) {
        const indexColId = this.knownIdRegistry.getTableIndexColumnId(
          tableMetadata.database,
          tableMetadata.name,
          undefined,
          index.name,
          column.name
        );
        index.cols.push({
          id: indexColId,
          colid: column.id
        });
      }
    });
  }

  public createIndex(
    tableMetadata: TableMetadata,
    row: IndexMetadataRow
  ): IndexMetadata {
    const name = row.INDEX_NAME;
    const indexId = this.knownIdRegistry.getTableIndexId(
      tableMetadata.database,
      tableMetadata.name,
      undefined,
      name
    );
    const result = {
      id: indexId,
      name,
      unique: row.NON_UNIQUE === 0,
      fulltext: row.INDEX_TYPE === "FULLTEXT",
      using: row.INDEX_TYPE,
      cols: [] as CommonColumnReferenceMetadata[]
    };
    tableMetadata.indexes.set(result.name, result);
    return result;
  }
}
