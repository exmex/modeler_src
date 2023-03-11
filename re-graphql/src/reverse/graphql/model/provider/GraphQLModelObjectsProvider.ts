import { ModelPartProvider, NamesRegistry } from "re";

import { GraphQLModelRefsFixator } from "./GraphQLModelRefsFixator";
import { GraphQLOtherObjectsProvider } from "./GraphQLOtherObjectsProvider";
import { GraphQLRelationsProvider } from "./GraphQLRelationsProvider";
import { GraphQLTablesProvider } from "./GraphQLTablesProvider";
import { ModelObjects } from "common";

export class GraphQLModelObjectsProvider implements ModelPartProvider<ModelObjects>{

    public constructor(
        private otherObjectsProvider: GraphQLOtherObjectsProvider,
        private tablesProvider: GraphQLTablesProvider,
        private relationsProvider: GraphQLRelationsProvider,
        private modelRefsFixator: GraphQLModelRefsFixator,
        private namesRegistry: NamesRegistry) {
    }

    public async provide(): Promise<ModelObjects> {
        const otherObjects = await this.otherObjectsProvider.provide();
        const tablesOtherObjects = await this.tablesProvider.provide();
        const relations = await this.relationsProvider.provide();
        const model = this.modelRefsFixator.modelRefsFixator({
            otherObjects: { ...otherObjects, ...tablesOtherObjects.otherObjects },
            tables: { ...tablesOtherObjects.tables },
            relations,
            order: []
        });

        Object.keys(model.tables).map(key => model.tables[key]).forEach(table => this.namesRegistry.registerTable(table));
        Object.keys(model.otherObjects).map(key => model.otherObjects[key]).forEach(otherObject => this.namesRegistry.registerOtherObject(otherObject));

        return model;
    }

}
