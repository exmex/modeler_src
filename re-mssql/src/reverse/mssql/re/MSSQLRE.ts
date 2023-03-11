import { MSSQLFeatures } from "../MSSQLFeatures";
import { QueryResultRow } from "./QueryResultRow";
import { SQLHandledConnection } from "re";

export abstract class MSSQLRE<T extends QueryResultRow> {
  protected connection: SQLHandledConnection<MSSQLFeatures>;
  protected features: MSSQLFeatures;

  public constructor(
    connection: SQLHandledConnection<MSSQLFeatures>,
    features: MSSQLFeatures
  ) {
    this.connection = connection;
    this.features = features;
  }

  public abstract reverse(): Promise<T[]>;
}
