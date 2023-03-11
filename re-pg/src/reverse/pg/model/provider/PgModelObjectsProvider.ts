import { ModelPartProvider, NamesRegistry } from "re";

import { ModelObjects } from "common";
import { PgInternalObjectCleaner } from "./PgInternalObjectCleaner";
import { PgOrderBuilder } from "./PgOrderBuilder";
import { PgOtherObjectsProvider } from "./PgOtherObjectsProvider";
import { PgPartitionTableCleaner } from "./PgPartitionTableCleaner";
import { PgTablesRelationsProvider } from "./PgTablesRelationsProvider";

export class PgModelObjectsProvider implements ModelPartProvider<ModelObjects> {
  public constructor(
    private otherObjectsProvider: PgOtherObjectsProvider,
    private tablesRelationsProvider: PgTablesRelationsProvider,
    private internalObjectCleaner: PgInternalObjectCleaner,
    private partitionTableCleaner: PgPartitionTableCleaner,
    private orderBuilder: PgOrderBuilder,
    private namesRegistry: NamesRegistry
  ) {}

  public async provide(): Promise<ModelObjects> {
    const dirtyOtherObjectsResult = await this.otherObjectsProvider.provide();
    const dirtyTablesRelationsResult =
      await this.tablesRelationsProvider.provide();
    const otherObjectsResult = this.internalObjectCleaner.cleanup(
      dirtyOtherObjectsResult
    );
    const tablesRelationsResult = this.partitionTableCleaner.cleanup(
      dirtyTablesRelationsResult
    );

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
      otherObjects: otherObjectsResult,
      order: [] as string[]
    };

    const order = this.orderBuilder.reorder(modelWithoutOrder);

    return {
      ...tablesRelationsResult,
      otherObjects: otherObjectsResult,
      order
    };
  }
}
