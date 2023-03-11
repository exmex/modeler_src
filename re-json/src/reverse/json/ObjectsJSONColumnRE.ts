import { JSONObjects, JSONObjectsProvider } from "./JSONObjectsProvider";

import { CommonTablesMetadata } from "re";
import { JSONColumnMetamodelProvider } from "./JSONColumnMetamodelProvider";
import { JSONColumnRE } from "./JSONColumnRE";
import { JSONDocumentFactory } from "./JSONDocumentFactory";
import { JSONDocumentParser } from "./JSONDocumentParser";
import { JSONMetamodelProvider } from "./JSONMetamodelProvider";
import { JSONTableColumn } from "./triage/JSONTableColumn";

export class ObjectsJSONColumnRE implements JSONColumnRE {
  private jsonObjectProvider: JSONObjectsProvider;
  private metamodelProvider: JSONMetamodelProvider;
  private documentParser: JSONDocumentParser;
  private documentFactory: JSONDocumentFactory;
  private columnMetamodelProvider: JSONColumnMetamodelProvider;

  public constructor(jsonObjectsProvider: JSONObjectsProvider) {
    this.jsonObjectProvider = jsonObjectsProvider;
    this.columnMetamodelProvider = new JSONColumnMetamodelProvider();
    this.metamodelProvider = new JSONMetamodelProvider(
      this.columnMetamodelProvider
    );
    this.documentParser = new JSONDocumentParser();
    this.documentFactory = new JSONDocumentFactory();
  }

  public async reverse(
    jsonColumn: JSONTableColumn
  ): Promise<CommonTablesMetadata> {
    const rootDocument = this.documentFactory.createDocument(jsonColumn);
    const result = await this.jsonObjectProvider.get(jsonColumn);
    let fails = 0;
    result.forEach((jsonObjectRecord: JSONObjects): void => {
      let jsonObject;
      if (typeof jsonObjectRecord[jsonColumn.column.name] === "string") {
        try {
          jsonObject = JSON.parse(jsonObjectRecord[jsonColumn.column.name]);
        } catch (e) {
          console.log(
            `JSON Column RE Error: ${(e as any).message
            }\nField ${jsonColumn.getFullname()} contains unparaseable JSON.`
          );
          fails++;
        }
      } else {
        jsonObject = jsonObjectRecord[jsonColumn.column.name];
      }
      if (jsonObject) {
        this.documentParser.parseDocument(jsonObject, rootDocument);
      }
    });

    console.log(
      `\t# records: ${result.length} - (${jsonColumn.getFullname()})`
    );
    console.log(`\t# failed records: ${fails} - (${jsonColumn.getFullname()})`);

    if (result.length - fails > 0) {
      const tableMetadata =
        this.metamodelProvider.transformDocumentToModel(rootDocument);
      jsonColumn.column.datatype = tableMetadata.id;
      jsonColumn.column.collation = undefined;
      jsonColumn.column.charset = undefined;
      return this.metamodelProvider.resultStore;
    }
    return {};
  }
}
