import { PgQuotation } from "../../../../db/pg/pg-quotation";
import { PgTriggerMetadata } from "../metadata/PgTriggerMetadata";
import { SourceGenerator } from "./SourceGenerator";

export class PgTriggerSourceGenerator
  implements SourceGenerator<PgTriggerMetadata>
{
  constructor(private quotation: PgQuotation, private includeSchema: boolean) {}

  public generate(metadata: PgTriggerMetadata): string {
    const schemaPrefix = `${this.quotation.quoteIdentifier(
      metadata._schema
    )}\\.`;
    return `${
      this.includeSchema === true
        ? metadata._code
        : metadata._code.replace(new RegExp(schemaPrefix, "g"), ``)
    };\n`;
  }
}
