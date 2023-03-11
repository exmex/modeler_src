import {
  Column,
  Index,
  OtherObject,
  OtherObjectTypes,
  Relation,
  Table
} from "common";

import { ContainerNameProvider } from "./ContainerNameProvider";

export class NameBuilder {
  public constructor(private _containerNameProvider: ContainerNameProvider) {}

  public getTableName(table: Table): string {
    const containerPrefixName =
      this._containerNameProvider.getContainerPrefixName(table);
    return `${containerPrefixName}${table.name}`;
  }
  public getColumnName(table: Table, column: Column): string {
    const containerPrefixName =
      this._containerNameProvider.getContainerPrefixName(table);
    return `${containerPrefixName}${table.name}.${column.name}`;
  }
  public getOtherObjectName(otherObject: OtherObject): string {
    const containerPrefixName =
      this._containerNameProvider.getContainerPrefixName(otherObject);
    if (otherObject.type === OtherObjectTypes.Trigger) {
      const tablePrefixName =
        this._containerNameProvider.getTablePrefixName(otherObject);
      return `${containerPrefixName}${tablePrefixName}${otherObject.name}`;
    }
    return `${containerPrefixName}${otherObject.name}`;
  }

  public getCompositeName(composite: Table): string {
    const containerPrefixName =
      this._containerNameProvider.getContainerPrefixName(composite);
    return `${containerPrefixName}${composite.name}`;
  }
  public getIndexName(table: Table, index: Index): string {
    const containerPrefixName =
      this._containerNameProvider.getContainerPrefixName(table);
    return `${containerPrefixName}${table.name}.${index.name}`;
  }

  public getRelationName(relation: Relation): string {
    return relation.name;
  }
}
