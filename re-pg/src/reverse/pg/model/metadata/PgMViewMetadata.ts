import { SourceMetadata } from "../provider/SourceMetadata";

export interface PgMViewMetadata extends SourceMetadata {
    _storageparameters: string[];
    _withdata: boolean;
    _tablespace: string;
}