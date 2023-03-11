import { CommonTableMetadata } from "re";
import { SQLiteColumnMetadata } from "./SQLiteColumnMetadata";
import { SQLiteConstraintMetadata } from "./SQLiteConstraintMetadata";
import { SQLiteIndexMetadata } from "./SQLiteIndexMetadata";

export interface SQLiteTablesMetadata {
  [key: string]: SQLiteTableMetadata;
}

export class SQLiteTableMetadata extends CommonTableMetadata<SQLiteColumnMetadata> {
  public constraints: SQLiteConstraintMetadata[] = [];
  public indexes: SQLiteIndexMetadata[] = [];
  public columns: SQLiteColumnMetadata[] = [];

  public constructor(
    id: string,
    name: string,
    embeddable: boolean,
    estimatedSize: string,
    visible: boolean,
    public withoutrowid: boolean,
    public strict: boolean,
    public desc: string
  ) {
    super(id, name, embeddable, estimatedSize, visible);
  }
}
