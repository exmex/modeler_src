import { MSSQLQuotation } from "../../../../db/mssql/mssql-quotation";
import { MSSQLRoutineMetadata } from "../metadata/MSSQLRoutineMetadata";
import { SourceGenerator } from "./SourceGenerator";

export class MSSQLRoutineSourceGenerator
  implements SourceGenerator<MSSQLRoutineMetadata>
{
  constructor(
    private quotation: MSSQLQuotation,
    private includeSchema: boolean
  ) {}

  public generate(metadata: MSSQLRoutineMetadata): string {
    const schemaItemName = `${this.quotation.quoteIdentifier(
      metadata._schema,
      false
    )}.${this.quotation.quoteIdentifier(metadata._name, false)}`;
    const itemName = this.quotation.quoteIdentifier(metadata._name, false);
    return `${
      this.includeSchema === true
        ? metadata._code
        : metadata._code.replace(schemaItemName, itemName)
    }`;
  }
}
