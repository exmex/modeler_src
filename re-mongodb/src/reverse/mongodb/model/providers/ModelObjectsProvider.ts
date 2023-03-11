import { ModelFinder, ModelPartProvider } from "re";

import { ModelObjects } from "common";
import { OtherObjectsProvider } from "./common/OtherObjectsProvider";
import { RelationsProvider } from "./common/relation/RelationsProvider";
import { TablesProvider } from "./common/table/TablesProvider";

export class ModelObjectsProvider implements ModelPartProvider<ModelObjects> {
    public constructor(
        private tablesProvider: TablesProvider,
        private relationsProvider: RelationsProvider,
        private otherObjectsProvider: OtherObjectsProvider) {
    }

    public async provide(): Promise<ModelObjects> {
        const otherObjects = await this.otherObjectsProvider.provide();
        const tables = await this.tablesProvider.provide();
        const relations = this.relationsProvider.provide(new ModelFinder(tables, {}, otherObjects));

        return { tables, relations, otherObjects, order: [] }
    }
}
