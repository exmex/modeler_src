import { BSONColumnsProvider } from "./BSONColumnsProvider";
import { BSONField } from "../../../../re/bson/BSONField";
import { BSONNestedDocumentProvider } from "../table/BSONNestedDocumentProvider";
import { NestedDocumentStructureRegistry } from "../../common/NestedDocumentStructureRegistry";

export class BSONDatatypeProvider {
  public constructor(
    private nestedDocumentProvider: BSONNestedDocumentProvider,
    private nestedDocumentStructureRegistry: NestedDocumentStructureRegistry
  ) {}

  public async provide(
    field: BSONField
  ): Promise<{ datatype: string; any: string }> {
    if (field.subDocument) {
      const subDocument = await this.nestedDocumentProvider.provide(
        field.subDocument,
        new BSONColumnsProvider(this, field.subDocument)
      );
      this.nestedDocumentStructureRegistry.register(subDocument);
      return { datatype: subDocument.id, any: "" };
    } else {
      return { datatype: field.defaultDatatype(), any: field.any() };
    }
  }
}
