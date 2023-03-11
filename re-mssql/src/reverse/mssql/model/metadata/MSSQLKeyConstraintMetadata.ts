export interface MSSQLKeyConstraintMetadata {
  id: string;
  schema: string;
  table: string;
  name: string;
  columns: string[];
  isUnique: boolean;
  isPrimaryKey: boolean;
  clustered: boolean;

  comment: string;
}
