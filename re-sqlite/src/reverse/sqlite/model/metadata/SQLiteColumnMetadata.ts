export interface SQLiteColumnMetadata {
  id: string;
  name: string;
  datatype: string;
  pk: boolean;
  nn: boolean;
  defaultvalue: string;
  collation: string;
  json: boolean;
  autoincrement: boolean;
  comment: string;
  data: string;
  estimatedSize: string;

  fk?: boolean;
}
