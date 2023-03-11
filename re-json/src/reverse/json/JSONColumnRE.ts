import { CommonTablesMetadata } from "re";
import { JSONTableColumn } from "./triage/JSONTableColumn";

export interface JSONColumnRE {
    reverse(jsonColumn: JSONTableColumn): Promise<CommonTablesMetadata>;
}
