import { CommonSchemaMetadata, QueryExecutor } from "re";

import { PgQuotation } from "../../../db/pg/pg-quotation";
import { PgSchemaMetadataBuilder } from "./builder/PgSchemaMetadataBuilder";

const QUERY = `SELECT $1::regnamespace as _schema, obj_description($1::regnamespace, 'pg_namespace') AS _schema_comment`;

export class PgSchemaRE {
  public constructor(
    private queryExecutor: QueryExecutor,
    private schema: string
  ) {}

  public async reverse(): Promise<CommonSchemaMetadata | undefined> {
    const quotation = new PgQuotation();
    const result = (
      await this.queryExecutor.query(QUERY, [
        quotation.quoteIdentifier(this.schema)
      ])
    ).rows;
    const builder = new PgSchemaMetadataBuilder(result);
    return builder.build();
  }
}
