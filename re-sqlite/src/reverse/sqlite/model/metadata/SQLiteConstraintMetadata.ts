export interface SQLiteConstraintMetadata {
  id: string;
  table: string;
  name: string;
  type: string;
  columns: string[];
  foreigntable: string;
  foreigncolumns: string[];
  definition: string;
  updatetype: string;
  deletetype: string;
  c_cch: string;
  c_cp: string;
  desc: string;
}
