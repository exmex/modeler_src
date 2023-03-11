import { Column } from "common";

export interface ColumnsProvider {
    provide(): Promise<Column[]>
}