import { BSONDatatypeProvider } from "./BSONDatatypeProvider";
import { BSONDocument } from "../../../../re/bson/BSONDocument";
import { BSONField } from "../../../../re/bson/BSONField";
import { Column } from "common";
import { ColumnsProvider } from "../../common/table/ColumnsProvider";

export class BSONColumnsProvider implements ColumnsProvider {
  public constructor(
    private datatypeProvider: BSONDatatypeProvider,
    private document: BSONDocument
  ) {}

  public async provide(): Promise<Column[]> {
    const results: Promise<Column>[] = [];
    this.document.fields.forEach((field: BSONField): void => {
      results.push(this.createColumn(field));
    });

    return Promise.all(results);
  }

  private async createColumn(field: BSONField): Promise<Column> {
    const { datatype, any } = await this.datatypeProvider.provide(field);

    return {
      comment: "",
      data: "",
      datatype,
      any,
      defaultvalue: "",
      id: field.id,
      list: field.isList(),
      name: field.name,
      nn: field.isNotNull(),
      param: "",
      pk: field.isPk(),
      after: "",
      autoinc: false,
      charset: "",
      collation: "",
      enum: "",
      unsigned: false,
      zerofill: false,
      isHidden: false,
      estimatedSize: ""
    };
  }
}
