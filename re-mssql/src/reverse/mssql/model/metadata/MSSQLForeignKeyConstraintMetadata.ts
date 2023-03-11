export interface MSSQLForeignKeyConstraintMetadata {
  id: string;
  name: string;
  schema: string;
  table: string;
  columns: string[];
  foreignschema: string;
  foreigntable: string;
  foreigncolumns: string[];
  updatetype: string;
  deletetype: string;
  c_cp: string;
  c_cch: string;

  comment: string;
}
