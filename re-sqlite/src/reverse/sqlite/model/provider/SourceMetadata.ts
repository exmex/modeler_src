import { QueryResultRow } from "../../re/QueryResultRow";

export interface SourceMetadata extends QueryResultRow {
  _id: string;
  _name: string;
  _code: string;
}
