import { SourceMetadata } from "../provider/SourceMetadata";

export interface MSSQLUserDefinedTypeMetadata extends SourceMetadata {
  _original_schema: string;
  _original_name: string;
  _params?: string;
  _is_nullable: boolean;
}
