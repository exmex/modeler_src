import {
  CommonColumnMetadata,
  CommonTableMetadata,
  CommonTablesMetadata
} from "re";

import { JSONColumnMetamodelProvider } from "./JSONColumnMetamodelProvider";
import { JSONDocument } from "./triage/JSONDocument";
import { v4 as uuidv4 } from "uuid";

export class JSONMetamodelProvider {
  private columnMetamodelProvider: JSONColumnMetamodelProvider;
  public resultStore: CommonTablesMetadata = {};

  constructor(columnMetamodelProvider: JSONColumnMetamodelProvider) {
    this.columnMetamodelProvider = columnMetamodelProvider;
  }

  public transformDocumentToModel(
    document: JSONDocument
  ): CommonTableMetadata<CommonColumnMetadata> {
    const tableMetadata = new CommonTableMetadata<CommonColumnMetadata>(
      uuidv4(),
      document.name,
      true,
      "",
      true
    );
    tableMetadata.columns = this.columnMetamodelProvider.transform(
      this,
      document.fields
    );
    this.resultStore[tableMetadata.id] = tableMetadata;
    return tableMetadata;
  }
}
