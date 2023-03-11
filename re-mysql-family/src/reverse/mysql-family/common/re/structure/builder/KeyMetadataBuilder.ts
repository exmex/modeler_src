import { CommonColumnMetadata, KnownIdRegistry } from "re";

import { KeyMetadata } from "../../../metadata/KeyMetadata";
import { TableMetadata } from "../../../metadata/TableMetadata";
import { v4 as uuidv4 } from "uuid";

export interface KeyMetadataBuilderRow {
  CONSTRAINT_TYPE: string;
  COLUMN_NAME: string;
  CONSTRAINT_NAME: string;
  TABLE_NAME: string;
  COLUMN_COMMENT: string;
}

export class KeyMetadataBuilder {
  public constructor(private knownIdRegistry: KnownIdRegistry) {}

  public transform(
    result: KeyMetadataBuilderRow[],
    tablesMetadata: Map<string, TableMetadata>,
    pk: boolean
  ): void {
    result.forEach((row: KeyMetadataBuilderRow): void => {
      if (
        (pk && row.CONSTRAINT_TYPE === "PRIMARY KEY") ||
        (!pk && row.CONSTRAINT_TYPE === "UNIQUE")
      ) {
        const tableMetadata = tablesMetadata.get(
          row.TABLE_NAME
        ) as TableMetadata;
        this.addKey(tableMetadata, row, pk);
      }
    });
  }

  private addKey(
    tableMetadata: TableMetadata,
    row: KeyMetadataBuilderRow,
    pk: boolean
  ): void {
    const col = tableMetadata.columns.find(
      (c) => c.name === row.COLUMN_NAME
    ) as CommonColumnMetadata;
    if (pk && col) {
      col.pk = true;
    }
    let key = tableMetadata.keys.get(row.CONSTRAINT_NAME);
    if (!key) {
      const name = row.CONSTRAINT_NAME;
      const keyId = this.knownIdRegistry.getTableKeyId(
        tableMetadata.database,
        tableMetadata.name,
        undefined,
        name,
        pk
      );
      const keyMetadata = new KeyMetadata(keyId, name, pk);
      tableMetadata.keys.set(keyMetadata.name, keyMetadata);
      key = keyMetadata;
    }
    const keyColId = this.knownIdRegistry.getTableKeyColumnId(
      tableMetadata.database,
      tableMetadata.name,
      undefined,
      key.name,
      col.name,
      pk
    );
    key.cols.push({ id: keyColId, colid: col.id });
  }
}
