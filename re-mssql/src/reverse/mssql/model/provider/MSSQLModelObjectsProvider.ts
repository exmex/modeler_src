import { ModelPartProvider, NamesRegistry } from "re";

import { MSSQLDependencyResolver } from "./MSSQLDependencyResolver";
import { MSSQLOrderBuilder } from "./MSSQLOrderBuilder";
import { MSSQLOtherObjectsProvider } from "./MSSQLOtherObjectsProvider";
import { MSSQLTablesRelationsProvider } from "./MSSQLTablesRelationsProvider";
import { ModelObjects } from "common";

export class MSSQLModelObjectsProvider
  implements ModelPartProvider<ModelObjects>
{
  public constructor(
    private otherObjectsProvider: MSSQLOtherObjectsProvider,
    private tablesRelationsProvider: MSSQLTablesRelationsProvider,
    private orderBuilder: MSSQLOrderBuilder,
    private namesRegistry: NamesRegistry,
    private dependencyResolver: MSSQLDependencyResolver
  ) {}

  public async provide(): Promise<ModelObjects> {
    const dirtyOtherObjectsResult = await this.otherObjectsProvider.provide();
    const dirtyTablesRelationsResult =
      await this.tablesRelationsProvider.provide();
    const otherObjectsResult = dirtyOtherObjectsResult;
    const tablesRelationsResult = dirtyTablesRelationsResult;

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

    await this.dependencyResolver.resolve(
      tablesRelationsResult.tables,
      otherObjectsResult
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
