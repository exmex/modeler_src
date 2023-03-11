import { QueryResultRow } from "./QueryResultRow";
import { SQLiteHandledConnection } from "../../../db/sqlite/sqlite-handled-connection";

export abstract class SQLiteRE<T extends QueryResultRow>  {
    public constructor(protected connection: SQLiteHandledConnection) {
    }

    public abstract reverse(): Promise<T[]>;
}