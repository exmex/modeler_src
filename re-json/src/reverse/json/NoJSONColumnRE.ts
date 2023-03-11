import { CommonTablesMetadata } from "re";
import { JSONColumnRE } from "./JSONColumnRE";
import { JSONTableColumn } from "./triage/JSONTableColumn";

export class NoJSONColumnRE implements JSONColumnRE {
    reverse(jsonColumn: JSONTableColumn): Promise<CommonTablesMetadata> {
        return Promise.resolve({});
    }
}
