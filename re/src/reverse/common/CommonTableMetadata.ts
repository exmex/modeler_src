import { CommonColumnMetadata } from "./CommonColumnMetadata";

export interface CommonTablesMetadata {
  [key: string]: CommonTableMetadata<CommonColumnMetadata>;
}
export class CommonTableMetadata<Column extends CommonColumnMetadata> {
  public columns: Column[] = [];

  public constructor(
    public id: string,
    public name: string,
    public embeddable: boolean,
    public estimatedSize: string,
    public visible: boolean
  ) {}
}
