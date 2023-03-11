export interface MSSQLCheckConstraintMetadata {
  name: string;
  schema: string;
  table: string;
  column: string;
  definition: string;

  comment: string;
}
