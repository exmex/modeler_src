import { JSONTableColumn } from "./triage/JSONTableColumn";

export interface JSONObjects {
    [key: string]: string;
}

export interface JSONObjectsProvider {
    get(jsonColumn: JSONTableColumn): Promise<JSONObjects[]>;
}
