import {
  OtherObject,
  OtherObjectTypes,
  Relation,
  ReverseStatItem,
  ReverseStatItemCounter,
  Table
} from "common";

import { KnownIdRegistry } from "./KnownIdRegistry";
import { NameBuilder } from "./NameBuilder";
import { NamesRegistry } from "../NamesRegistry";
import _ from "lodash";

export class CounterBuilder {
  public constructor(
    private _nameBuilder: NameBuilder,
    private _namesRegistry: NamesRegistry,
    private _knownIdRegistry: KnownIdRegistry
  ) {}

  private mapIdNames(listOfChanges: any): {
    id: string;
    name: string;
    containerId?: string;
  }[] {
    return _.map(
      listOfChanges,
      (item): { name: string; id: string; containerId?: string } => ({
        name: item.name,
        id: item.obj?.id,
        containerId: item.container?.id
      })
    );
  }

  private build(
    source: { name: string; obj: { id: string }; container?: { id: string } }[],
    target: { name: string; obj: { id: string }; container?: { id: string } }[]
  ): ReverseStatItemCounter {
    const removed = _.filter(
      source,
      (sourceItem) =>
        !_.find(
          target,
          (targetProperty) => targetProperty.obj.id === sourceItem.obj.id
        )
    );

    const added = _.filter(
      target,
      (targetProperty) =>
        !_.find(
          source,
          (sourceProperty) => sourceProperty.obj.id === targetProperty.obj.id
        )
    );

    const modified = _.filter(target, (targetProperty) => {
      const sourceProperty = _.find(
        source,
        (sourceProperty) => sourceProperty.obj.id === targetProperty.obj.id
      );

      return (
        !!sourceProperty &&
        !_.isEqual(
          JSON.parse(JSON.stringify(targetProperty?.obj ?? {})),
          JSON.parse(JSON.stringify(sourceProperty?.obj ?? {}))
        )
      );
    });

    const removedCount = _.size(removed);
    const total = _.size({ ...source, ...target }) - removedCount;

    return {
      added: {
        count: _.size(added),
        idNames: this.mapIdNames(added)
      },
      modified: {
        count: _.size(modified),
        idNames: this.mapIdNames(modified)
      },
      removed: {
        count: removedCount,
        idNames: this.mapIdNames(removed)
      },
      total
    };
  }

  public createReverseStatItem(
    caption: string,
    source: any,
    target: any
  ): ReverseStatItem {
    return {
      caption,
      counter: this.build(source, target)
    };
  }

  private filterTables(t: Table) {
    return t.objectType === "table" || !t.objectType;
  }

  private filterComposites(t: Table) {
    return t.objectType === "composite";
  }

  public getTables(tables: Table[]) {
    return _.map(_.filter(tables, this.filterTables), (table) => ({
      obj: table,
      name: this._nameBuilder.getTableName(table)
    }));
  }

  public getOriginalTables() {
    return this.getTables(this._knownIdRegistry.getTables());
  }

  public getOriginalTablesArray() {
    return _.map(this._knownIdRegistry.getTables(), (table) => table);
  }

  public getUpdatedTables() {
    return this.getTables(this._namesRegistry.tables);
  }

  public getUpdatedTablesArray() {
    return _.map(this._namesRegistry.tables, (table) => table);
  }

  public getOtherObjects(type: string, otherObjects: OtherObject[]) {
    return _.map(
      _.filter(otherObjects, (oo) => oo.type === type),
      (oo) => ({
        obj: oo,
        name: this._nameBuilder.getOtherObjectName(oo)
      })
    );
  }

  public getOriginalOtherObjects(type: string) {
    return this.getOtherObjects(type, this._knownIdRegistry.getOtherObjects());
  }

  public getUpdatedOtherObjects(type: string) {
    return this.getOtherObjects(type, this._namesRegistry.otherObjects);
  }

  public getComposites(tables: Table[]) {
    return _.map(_.filter(tables, this.filterComposites), (composite) => ({
      obj: composite,
      name: this._nameBuilder.getCompositeName(composite)
    }));
  }

  public getOriginalComposites() {
    return this.getComposites(this._knownIdRegistry.getTables());
  }

  public getUpdatedComposites() {
    return this.getComposites(this._namesRegistry.tables);
  }

  public getColumns(tables: Table[]): any {
    return _.reduce(
      tables,
      (r, t) => [
        ...r,
        ..._.map(t.cols, (col) => ({
          obj: col,
          container: t,
          name: this._nameBuilder.getColumnName(t, col)
        }))
      ],
      []
    );
  }

  public getOriginalColumns(): any {
    return this.getColumns(this.getOriginalTablesArray());
  }

  public getUpdatedColumns(): any {
    return this.getColumns(this.getUpdatedTablesArray());
  }

  public getIndexes(tables: Table[]): any {
    return _.reduce(
      tables,
      (r, t) => [
        ...r,
        ..._.map(t.indexes, (ix) => ({
          obj: ix,
          container: t,
          name: this._nameBuilder.getIndexName(t, ix)
        }))
      ],
      []
    );
  }

  public getOriginalIndexes(): any {
    return this.getIndexes(this.getOriginalTablesArray());
  }

  public getUpdatedIndexes(): any {
    return this.getIndexes(this.getUpdatedTablesArray());
  }

  public getRelations(relations: Relation[]) {
    return _.map(relations, (relation) => ({
      obj: relation,
      name: this._nameBuilder.getRelationName(relation)
    }));
  }

  public getOriginalRelations(): any {
    return this.getRelations(this._knownIdRegistry.getRelations());
  }

  public getUpdatedRelations(): any {
    return this.getRelations(this._namesRegistry.relations);
  }

  public createTablesCounter() {
    return this.createReverseStatItem(
      "L_TABLES",
      this.getOriginalTables(),
      this.getUpdatedTables()
    );
  }

  public createCompositesCounter() {
    return this.createReverseStatItem(
      "L_COMPOSITES",
      this.getOriginalComposites(),
      this.getUpdatedComposites()
    );
  }

  public createTableColumnsCounter() {
    return this.createReverseStatItem(
      "L_COLUMNS",
      this.getOriginalColumns(),
      this.getUpdatedColumns()
    );
  }

  public createTableIndexesCounter() {
    return this.createReverseStatItem(
      "L_INDEXES",
      this.getOriginalIndexes(),
      this.getUpdatedIndexes()
    );
  }

  public createTableRelationsCounter() {
    return this.createReverseStatItem(
      "L_RELATIONS",
      this.getOriginalRelations(),
      this.getUpdatedRelations()
    );
  }

  private convertOtherObjectTypeToLocalization(type: string) {
    switch (type) {
      case OtherObjectTypes.Query:
        return "L_QUERIES";
      case OtherObjectTypes.Policy:
        return "L_POLICIES";
      case OtherObjectTypes.MaterializedView:
        return "L_MATERIALIZED_VIEWS";
      default:
        return `L_${type.toUpperCase()}S`;
    }
  }

  public createOtherObjectsCounter(type: string) {
    return this.createReverseStatItem(
      this.convertOtherObjectTypeToLocalization(type),
      this.getOriginalOtherObjects(type),
      this.getUpdatedOtherObjects(type)
    );
  }
}
