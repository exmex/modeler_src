import { CommonSchemaMetadata } from "re";
import _ from "lodash";

interface MSSQLSchemaMetadataBuilderRow {
  _schema: string;
  _schema_comment: string;
}

export class MSSQLSchemaMetadataBuilder {
  public constructor(private result: MSSQLSchemaMetadataBuilderRow[]) { }

  public build(): CommonSchemaMetadata[] {
    return _.map(this.result, row => new CommonSchemaMetadata(row._schema, row._schema_comment));
  }
}
