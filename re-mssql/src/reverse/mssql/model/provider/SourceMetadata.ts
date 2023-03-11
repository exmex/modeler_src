import { QueryResultRow } from "../../re/QueryResultRow";

export interface SourceMetadata extends QueryResultRow {
  _schema: string;
  _name: string;
  _code: string;
  _comment: string;
}
