import { SourceMetadata } from "../provider/SourceMetadata";

export interface MSSQLPolicyMetadata extends SourceMetadata {
  _table_name: string;
  _command: string;
  _roles: string;
  _using_expression: string;
  _check_expression: string;
  _permissive: boolean;
}
