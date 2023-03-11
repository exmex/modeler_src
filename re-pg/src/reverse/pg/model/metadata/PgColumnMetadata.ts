import { CommonColumnMetadata } from "re";

export interface PgColumnMetadata extends CommonColumnMetadata {
    generatedIdentity: string;
    dimensions: number;
}
