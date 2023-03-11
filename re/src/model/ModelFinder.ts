import {
  Column,
  Key,
  OtherObject,
  OtherObjects,
  Relation,
  Relations,
  Table,
  Tables
} from "common";

import { RelationCol } from "common";

export class ModelFinder {
  public tables: Tables;
  public relations: Relations;
  private otherObjects: OtherObjects;

  public constructor(
    tables: Tables,
    relations: Relations,
    otherObjects: OtherObjects
  ) {
    this.tables = tables;
    this.relations = relations;
    this.otherObjects = otherObjects;
  }

  public findTable(name: string): Table | undefined {
    return Object.keys(this.tables)
      .map((tableId: string): Table => this.tables[tableId])
      .find((table): boolean => table.name === name);
  }

  public findTableById(id: string): Table | undefined {
    return Object.keys(this.tables)
      .map((tableId): Table => this.tables[tableId])
      .find((table): boolean => table.id === id);
  }

  public findColumn(owner: Table, name: string): Column | undefined {
    return owner.cols.find((col: Column): boolean => col.name === name);
  }

  private sameRelationByColumns(relation: Relation, cols: Column[]): boolean {
    return relation.cols.reduce<boolean>(
      (r: boolean, i: RelationCol, index: number) =>
        r && cols[index] && i.childcol === cols[index].id,
      true
    );
  }

  public findRelation(
    parent: Table,
    child: Table,
    childColumns: Column[]
  ): Relation | undefined {
    return Object.keys(this.relations)
      .map((relationId): Relation => this.relations[relationId])
      .find((relation): boolean => {
        return (
          relation.parent === parent.id &&
          relation.child === child.id &&
          this.sameRelationByColumns(relation, childColumns)
        );
      });
  }

  public findPk(name: string): Key | undefined {
    const parentTable = this.findTable(name);
    return (
      parentTable && parentTable.keys.find((key: Key): boolean => key.isPk)
    );
  }

  public findOtherObject(name: string, type: string): OtherObject | undefined {
    return Object.keys(this.otherObjects)
      .map((id: string): OtherObject => this.otherObjects[id])
      .find((o): boolean => {
        return o.name === name && o.type === type;
      });
  }
}
