import { MSSQLQuotation } from "../../../../db/mssql/mssql-quotation";
import { MSSQLTriggerMetadata } from "../metadata/MSSQLTriggerMetadata";
import { SourceGenerator } from "./SourceGenerator";

export class MSSQLTriggerSourceGenerator
  implements SourceGenerator<MSSQLTriggerMetadata>
{
  constructor(
    private quotation: MSSQLQuotation,
    private includeSchema: boolean
  ) {}

  public generate(metadata: MSSQLTriggerMetadata): string {
    const schemaPrefix = `${this.quotation.quoteIdentifier(
      metadata._schema,
      false
    )}\\.`;
    const escapeBracketsForRegExp = schemaPrefix
      .replace(`[`, `\\[`)
      .replace(`]`, `\\]`);
    return `${
      this.includeSchema === true
        ? metadata._code
        : metadata._code.replace(new RegExp(escapeBracketsForRegExp, "g"), ``)
    }`;
  }
}
