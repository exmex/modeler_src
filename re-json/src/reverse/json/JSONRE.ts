import { CommonTablesMetadata } from "re";
import { JSONColumnRE } from "./JSONColumnRE";
import { JSONColumnsProvider } from "./JSONColumnsProvider";

export class JSONRE {
    private jsonColumnRE: JSONColumnRE;

    public constructor(jsonColumnRE: JSONColumnRE) {
        this.jsonColumnRE = jsonColumnRE;
    }

    public async reverse(tablesMetadata: CommonTablesMetadata): Promise<CommonTablesMetadata> {
        let result = {};

        const provider = new JSONColumnsProvider(tablesMetadata);
        const jsonColumns = provider.getJSONColumns();

        console.log(`JSON Columns to reverse: ${jsonColumns.length}`);

        for (const jsonColumn of jsonColumns) {
            result = { ...result, ...(await this.jsonColumnRE.reverse(jsonColumn)) };
        }
        return result;
    }
}
