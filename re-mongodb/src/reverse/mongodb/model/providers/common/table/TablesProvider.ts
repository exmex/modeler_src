import { ModelPartProvider, NamesRegistry } from "re";
import { Table, Tables } from "common";

import { CollectionInfo } from "mongodb";
import { NestedDocumentStructureRegistry } from "../NestedDocumentStructureRegistry";
import { ProgressProvider } from "../../../../ProgressProvider";
import { TableDetailProviderFactory } from "./TableDetailProviderFactory";

export class TablesProvider implements ModelPartProvider<Tables> {
    public constructor(
        private collections: CollectionInfo[],
        private nestedDocumentStructureRegistry: NestedDocumentStructureRegistry,
        private tableDetailProviderFactory: TableDetailProviderFactory,
        private progressProvider: ProgressProvider,
        private namesRegistry: NamesRegistry
    ) {
    }

    public async provide(): Promise<Tables> {
        const rootDocumentStuctures = await this.provideRootDocumentStructures();
        this.nestedDocumentStructureRegistry.provide(rootDocumentStuctures);

        return this.convertDocumentStructuresToModelTables(rootDocumentStuctures);
    }

    private async createTable(collection: CollectionInfo, order: string): Promise<Table | undefined> {
        const tableDetailProvider = await this.tableDetailProviderFactory.build(collection);
        if (!tableDetailProvider) {
            return undefined;
        }

        const cols = await tableDetailProvider.getColumnsProvider().provide();
        const table: Table = {
            ...this.defaultvalues(),
            embeddable: false,
            collation: tableDetailProvider.getCollationProvider().provide(),
            cols,
            id: tableDetailProvider.getIdProvider().provide(),
            indexes: tableDetailProvider.getIndexesProvider().provide(),
            keys: tableDetailProvider.getKeysProvider().provide(cols),
            name: tableDetailProvider.getCollectionNameProvider().provide(),
            desc: tableDetailProvider.getDescriptionProvider().provide(),
            ...tableDetailProvider.getCappedProvider().provide(),
            ...tableDetailProvider.getValidatorProvider().provide(),
        };

        this.namesRegistry.registerTable(table);
        return table
    }

    private async provideRootDocumentStructures(): Promise<Table[]> {
        console.log(`Collections to reverse: ${this.collections.length}`);
        const result = [];
        let index = 0;

        this.progressProvider.register();

        for (const collection of this.collections) {

            const table = await this.createTable(collection, `${index + 1}/${this.collections.length}`);
            if (table) {
                result.push(table);
            }
            index++;
        }
        return result;
    }

    private convertDocumentStructuresToModelTables(tables: Table[]): Tables {
        const modelTables: Tables = {};
        tables.forEach((table): void => {
            modelTables[table.id] = table;
        });
        return modelTables;
    }

    protected defaultvalues(): Table {
        return {
            charset: "",
            collation: "",
            desc: "",
            freezeTableName: true,
            indexes: [],
            paranoid: true,
            relations: [],
            tabletype: "na",
            timestamps: true,
            version: false,
            visible: true,
            afterScript: "",
            cols: [],
            database: "",
            embeddable: false,
            id: "",
            initautoinc: "",
            lines: [],
            name: "",
            rowformat: "",
            keys: [],
            generate: true,
            generateCustomCode: true,
            estimatedSize: ""
        };
    }
}
