import { ModelObjects, Table } from "common";

import { NamesRegistry } from "re";

export class GraphQLModelRefsFixator {

    private namesRegistry: NamesRegistry;

    public constructor(namesRegistry: NamesRegistry) {
        this.namesRegistry = namesRegistry;
    }

    public modelRefsFixator(modelObjects: ModelObjects): ModelObjects {
        this.namesRegistry.notRegistredNames().forEach((item): void => {
            const tables = Object.keys(modelObjects.tables).map((key): Table => modelObjects.tables[key]);
            tables.forEach((table): void => {
                table.cols.forEach((col): void => {
                    if (col.datatype === item.id) {
                        if (["String", "Int", "Float", "Boolean", "ID", "Date"].find((defaultType) => defaultType === item.name)) {
                            col.datatype = item.name;
                        } else {
                            col.datatype = "String";
                        }
                    }
                })
            })
        });
        return modelObjects;
    }
}