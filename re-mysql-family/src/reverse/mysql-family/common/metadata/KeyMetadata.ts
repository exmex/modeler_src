import { CommonColumnReferenceMetadata } from "re";

export class KeyMetadata {
  public id: string;
  public name: string;
  public isPk: boolean;
  public cols: CommonColumnReferenceMetadata[] = [];

  public constructor(id: string, name: string, isPk: boolean) {
    this.id = id;
    this.name = name;
    this.isPk = isPk;
  }
}
