import { CommonTableMetadata } from "re";
import { MSSQLCheckConstraintMetadata } from "./MSSQLCheckConstraintMetadata";
import { MSSQLColumnMetadata } from "./MSSQLColumnMetadata";
import { MSSQLForeignKeyConstraintMetadata } from "./MSSQLForeignKeyConstraintMetadata";
import { MSSQLIndexMetadata } from "./MSSQLIndexMetadata";
import { MSSQLKeyConstraintMetadata } from "./MSSQLKeyConstraintMetadata";

export interface MSSQLTablesMetadata {
  [key: string]: MSSQLTableMetadata;
}

export class MSSQLTableMetadata extends CommonTableMetadata<MSSQLColumnMetadata> {
  public keyConstraints: Map<string, MSSQLKeyConstraintMetadata> = new Map<
    string,
    MSSQLKeyConstraintMetadata
  >();
  public checkConstraints: MSSQLCheckConstraintMetadata[] = [];
  public foreignKeyConstraints: Map<string, MSSQLForeignKeyConstraintMetadata> =
    new Map<string, MSSQLForeignKeyConstraintMetadata>();
  public indexes: Map<string, MSSQLIndexMetadata> = new Map<
    string,
    MSSQLIndexMetadata
  >();

  public constructor(
    id: string,
    name: string,
    embeddable: boolean,
    estimatedSize: string,
    visible: boolean,
    public schema: string,
    public comment: string,
    public objectType: string
  ) {
    super(id, name, embeddable, estimatedSize, visible);
  }
}
