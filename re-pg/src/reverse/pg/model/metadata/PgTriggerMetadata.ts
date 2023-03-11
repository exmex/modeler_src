import { SourceMetadata } from "../provider/SourceMetadata";

export interface PgTriggerMetadata extends SourceMetadata {
    _tablename: string;
}