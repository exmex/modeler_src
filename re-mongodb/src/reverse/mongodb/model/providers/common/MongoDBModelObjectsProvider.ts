import { ModelFinder, ModelPartProvider } from "re";

import { ModelObjects } from "common";
import { OtherObjectsProvider } from "./OtherObjectsProvider";
import { RelationsProvider } from "./relation/RelationsProvider";
import { TablesProvider } from "./table/TablesProvider";

export class MongoDBModelObjectsProvider implements ModelPartProvider<ModelObjects> {
    private tablesProvider: TablesProvider;
    private relationsProvider: RelationsProvider;
    private otherObjectsProvider: OtherObjectsProvider;

    public constructor(
        tablesProvider: TablesProvider,
        relationsProvider: RelationsProvider,
        otherObjectsProvider: OtherObjectsProvider) {
        this.tablesProvider = tablesProvider;
        this.relationsProvider = relationsProvider;
        this.otherObjectsProvider = otherObjectsProvider;
    }

    public async provide(): Promise<ModelObjects> {
        const otherObjects = await this.otherObjectsProvider.provide();
        const tables = await this.tablesProvider.provide();
        const relations = this.relationsProvider.provide(new ModelFinder(tables, {}, otherObjects));

        return { tables, relations, otherObjects, order: [] }
    }
}
