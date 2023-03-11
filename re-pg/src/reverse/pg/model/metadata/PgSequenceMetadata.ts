import { SourceMetadata } from "../provider/SourceMetadata";

export interface PgSequenceMetadata extends SourceMetadata {
    _cache: number;
    _cycle: boolean;
    _increment: number,
    _max: number;
    _min: number;
    _start: number;
}