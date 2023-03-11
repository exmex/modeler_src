import { QueryResultRow } from "pg";

export interface SourceMetadata extends QueryResultRow {
  _owner: string;
  _schema: string;
  _name: string;
  _code: string;
  _comment: string;
}
