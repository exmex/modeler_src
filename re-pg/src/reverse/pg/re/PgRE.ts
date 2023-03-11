import { PgFeatures } from "../PgFeatures";
import { QueryResultRow } from "pg";
import { SQLHandledConnection } from "re";

export abstract class PgRE<T extends QueryResultRow>  {
    protected connection: SQLHandledConnection<PgFeatures>;
    protected schema: string;
    protected features: PgFeatures;

    public constructor(connection: SQLHandledConnection<PgFeatures>, schema: string, features: PgFeatures) {
        this.connection = connection;
        this.schema = schema;
        this.features = features;
    }

    public abstract reverse(): Promise<T[]>;
}