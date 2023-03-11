import { Query } from "../Query";
import { QueryExecutor } from "re";

export interface TriggerMetadataRow {
    TRIGGER_NAME: string;
    ACTION_TIMING: string;
    EVENT_MANIPULATION: string;
    EVENT_OBJECT_TABLE: string;
    ACTION_STATEMENT: string;
    DEFINER: string;
}

const QUERY =
    `SELECT\n`
    + `TRIGGER_NAME, ACTION_TIMING, EVENT_MANIPULATION,EVENT_OBJECT_TABLE, ACTION_STATEMENT, ACTION_ORIENTATION,DEFINER\n`
    + `FROM information_schema.triggers\n`
    + `WHERE TRIGGER_SCHEMA = ?`

export class TriggerDbQuery implements Query<TriggerMetadataRow[]> {
    private queryExecutor: QueryExecutor
    private schema: string;

    public constructor(queryExecutor: QueryExecutor, schema: string) {
        this.queryExecutor = queryExecutor;
        this.schema = schema;
    }

    public async execute(): Promise<TriggerMetadataRow[]> {
        return await this.queryExecutor.query(QUERY, [this.schema])
    }
}
