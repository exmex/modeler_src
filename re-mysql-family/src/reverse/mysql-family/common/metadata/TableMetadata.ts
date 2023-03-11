import { CommonColumnMetadata, CommonTableMetadata } from "re";

import { IndexMetadata } from "./IndexMetadata";
import { KeyMetadata } from "./KeyMetadata";

export interface TablesMetadata {
  [key: string]: TableMetadata;
}

export class TableMetadata extends CommonTableMetadata<CommonColumnMetadata> {
  public database: string;
  public comment: string;
  public collation: string;
  public charset: string;
  public rowformat: string;
  public tabletype: string;
  public autoIncrement: string;
  public afterScript: string;

  public keys: Map<string, KeyMetadata>;
  public indexes: Map<string, IndexMetadata>;
  public relations: string[];

  public constructor(
    id: string,
    name: string,
    embeddable: boolean,
    estimatedSize: string,
    visible: boolean,
    database: string,
    comment: string,
    collation: string,
    charset: string,
    rowformat: string,
    tabletype: string,
    autoIncrement: string,
    afterScript: string
  ) {
    super(id, name, embeddable, estimatedSize, visible);
    this.database = database;
    this.comment = comment;
    this.collation = collation;
    this.charset = charset;
    this.rowformat = rowformat;
    this.tabletype = tabletype;
    this.autoIncrement = autoIncrement;
    this.afterScript = afterScript;

    this.keys = new Map<string, KeyMetadata>();
    this.indexes = new Map<string, IndexMetadata>();
    this.relations = [];
  }
}
