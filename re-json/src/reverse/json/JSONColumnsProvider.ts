import { CommonColumnMetadata, CommonTableMetadata, CommonTablesMetadata } from "re";

import { JSONTableColumn } from "./triage/JSONTableColumn";

export class JSONColumnsProvider {
    private tablesMetadata: CommonTablesMetadata;

    public constructor(tablesMetadata: CommonTablesMetadata) {
        this.tablesMetadata = tablesMetadata;
    }

    public getJSONColumns(): JSONTableColumn[] {
        const result: JSONTableColumn[] = [];
        Object
            .keys(this.tablesMetadata)
            .map((key) => this.tablesMetadata[key])
            .forEach((tableMetadata: CommonTableMetadata<CommonColumnMetadata>): void => {
                tableMetadata
                    .columns
                    .forEach((columnMetadata: CommonColumnMetadata): void => {
                        if (columnMetadata.json) {
                            result.push(new JSONTableColumn(tableMetadata.name, columnMetadata));
                        }
                    });
            });
        return result;
    }
}
