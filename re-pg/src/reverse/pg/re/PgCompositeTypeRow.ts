import { QueryResultRow } from "pg";

export interface PgCompositeTypeRow extends QueryResultRow {
  _owner: string;
  _schema: string;
  _name: string;
  _comment: string;
  _columns: [
    {
      name: string;
      datatype: string;
      comment: string;
    }
  ];
}
