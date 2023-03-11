import { SourceMetadata } from "../provider/SourceMetadata";

export interface MSSQLRuleMetadata extends SourceMetadata {
  _tablename: string;
}
