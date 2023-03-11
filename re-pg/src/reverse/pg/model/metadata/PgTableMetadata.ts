import { CommonTableMetadata } from "re";
import { PgColumnMetadata } from "./PgColumnMetadata";
import { PgConstraintMetadata } from "./PgConstraintMetadata";
import { PgIndexMetadata } from "./PgIndexMetadata";

export interface PgTablesMetadata {
  [key: string]: PgTableMetadata;
}

export class PgTableMetadata extends CommonTableMetadata<PgColumnMetadata> {
  public storageParams: string[] = [];
  public partitions: string[] = [];
  public partitionNames: string[] = [];
  public constraints: PgConstraintMetadata[] = [];
  public indexes: PgIndexMetadata[] = [];

  public constructor(
    id: string,
    name: string,
    embeddable: boolean,
    estimatedSize: string,
    visible: boolean,
    public schema: string,
    public comment: string,
    public collation: string,
    public onCommit: string,
    public tablespace: string,
    public partition: string,
    public owner: string,
    public objectType: string,
    public rowsecurity: boolean,
    public inherits: string,
    public inheritsArr: string[]
  ) {
    super(id, name, embeddable, estimatedSize, visible);
  }
}
