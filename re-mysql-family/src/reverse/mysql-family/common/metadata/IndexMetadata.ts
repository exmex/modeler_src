import { CommonColumnReferenceMetadata } from "re";
export interface IndexMetadata {
    id: string;
    name: string;
    unique: boolean;
    fulltext: boolean;
    using: string;
    cols: CommonColumnReferenceMetadata[];
}
