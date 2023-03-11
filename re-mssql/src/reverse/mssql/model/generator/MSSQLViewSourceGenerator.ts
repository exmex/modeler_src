import { MSSQLQuotation } from "../../../../db/mssql/mssql-quotation";
import { SourceGenerator } from "./SourceGenerator";
import { SourceMetadata } from "../provider/SourceMetadata";

export class MSSQLViewSourceGenerator
  implements SourceGenerator<SourceMetadata>
{
  constructor(
    private quotation: MSSQLQuotation,
    private includeSchema: boolean
  ) {}

  public generate(metadata: SourceMetadata): string {
    const schemaItemName = `${this.quotation.quoteIdentifier(
      metadata._schema,
      false
    )}.${this.quotation.quoteIdentifier(metadata._name, false)}`;
    const itemName = this.quotation.quoteIdentifier(metadata._name, false);
    return this.includeSchema === true
      ? metadata._code
      : metadata._code.replace(schemaItemName, itemName);
  }
}
