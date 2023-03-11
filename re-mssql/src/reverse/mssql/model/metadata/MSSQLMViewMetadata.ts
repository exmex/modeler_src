import { SourceMetadata } from "../provider/SourceMetadata";

export interface MSSQLMViewMetadata extends SourceMetadata {
  _storageparameters: string[];
  _withdata: boolean;
  _tablespace: string;
}
