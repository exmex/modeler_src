import { SourceMetadata } from "../provider/SourceMetadata";

export interface PgRuleMetadata extends SourceMetadata {
    _tablename: string;
}