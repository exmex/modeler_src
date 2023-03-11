import { ModelPartProvider, NamesRegistry } from "re";

import { ModelObjects } from "common";
import { SQLiteOtherObjectsProvider } from "./SQLiteOtherObjectsProvider";
import { SQLiteTablesRelationsProvider } from "./SQLiteTablesRelationsProvider";
import { SQLiteOrderBuilder } from "./SQLiteOrderBuilder";

export class SQLiteModelObjectsProvider
  implements ModelPartProvider<ModelObjects>
{
  public constructor(
    private otherObjectsProvider: SQLiteOtherObjectsProvider,
    private tablesRelationsProvider: SQLiteTablesRelationsProvider,
    private namesRegistry: NamesRegistry,
    private orderBuilder: SQLiteOrderBuilder
  ) {}

  public async provide(): Promise<ModelObjects> {
    const otherObjectsResult = await this.otherObjectsProvider.provide();
    const tablesRelationsResult = await this.tablesRelationsProvider.provide();

    Object.keys(tablesRelationsResult.tables)
      .map((key) => tablesRelationsResult.tables[key])
      .forEach((table) => this.namesRegistry.registerTable(table));
    Object.keys(tablesRelationsResult.relations)
      .map((key) => tablesRelationsResult.relations[key])
      .forEach((relation) => this.namesRegistry.registerRelation(relation));
    Object.keys(otherObjectsResult)
      .map((key) => otherObjectsResult[key])
      .forEach((otherObject) =>
        this.namesRegistry.registerOtherObject(otherObject)
      );

    const modelWithoutOrder = {
      ...tablesRelationsResult,
      otherObjects: otherObjectsResult
    };

    const order = this.orderBuilder.reorder(modelWithoutOrder);

    return {
      ...modelWithoutOrder,
      order
    };
  }
}
