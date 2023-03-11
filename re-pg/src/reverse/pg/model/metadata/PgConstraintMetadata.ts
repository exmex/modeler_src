export interface PgConstraintMetadata {
  id: string;
  name: string;
  type: string;
  schema: string;
  table: string;
  columns: string[];
  foreignschema: string;
  foreigntable: string;
  foreigncolumns: string[];
  definition: string;
  updatetype: string;
  deletetype: string;
  c_cp: string;
  c_cch: string;

  comment: string;
}
