import { SourceMetadata } from "../provider/SourceMetadata";

export interface MSSQLTriggerMetadata extends SourceMetadata {
  _tablename: string;
}
