export interface CommonColumnMetadata {
  id: string;
  name: string;
  datatype: string;

  collation?: string;
  charset?: string;

  json: boolean;

  list?: boolean;
  param?: string;
  pk?: boolean;
  nn?: boolean;
  comment?: string;
  defaultvalue?: string;
  zerofill?: boolean;
  unsigned?: boolean;
  after?: string;
  enumSet?: string;
  autoinc?: boolean;
  fk?: boolean;
  ref?: string;
  generated?: boolean;
  data?: string;
  estimatedSize?: string;
}
