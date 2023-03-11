import { DiagramItem, Diagrams, Table } from "common";
import {
  DiagramItemColorProvider,
  MainDiagramProvider,
  ModelPartProvider,
  NamesRegistry
} from "re";

import { DefinitionsRegistry } from "./provider/DefinitionsRegistry";
import _ from "lodash";

export class JSONSchemaDiagramsItemsProvider
  implements ModelPartProvider<Diagrams>
{
  public constructor(
    private _namesRegistry: NamesRegistry,
    private _definitionsRegistry: DefinitionsRegistry,
    private _diagramItemColorProvider: DiagramItemColorProvider,
    private _erdMainDiagramProvider: MainDiagramProvider
  ) {}

  private getSchemaObject() {
    return _.find(this._namesRegistry.tablesOfIds, (table) =>
      this.isSchemaRoot(table)
    );
  }

  private isSchemaRoot(table: Table): boolean {
    return this._definitionsRegistry.isDef(table.id) && !table.embeddable;
  }

  private getDefsObjects() {
    return _.filter(this._namesRegistry.tablesOfIds, (table) =>
      this.isDef(table)
    );
  }

  private isDef(table: Table): boolean {
    return this._definitionsRegistry.isDef(table.id) && table.embeddable;
  }

  private getOtherTableObjects() {
    return _.filter(this._namesRegistry.tablesOfIds, (table) =>
      this.isOtherTableObject(table)
    );
  }

  private isOtherTableObject(table: Table): boolean {
    return !this.isSchemaRoot(table) && !this.isDef(table);
  }

  protected getTableDiagramItems() {
    const schemaObject = this.getSchemaObject();
    const objects = schemaObject
      ? [schemaObject, ...this.getDefsObjects(), ...this.getOtherTableObjects()]
      : [];
    return objects
      .map((table): DiagramItem => {
        const colors = this._diagramItemColorProvider.getTableColor(table);
        return {
          x: 0,
          y: 0,
          gHeight: 0,
          gWidth: 0,
          background: colors.background,
          color: colors.color,
          referencedItemId: table.id,
          resized: false,
          autoExpand: true
        };
      })
      .reduce(
        (result, item) => ({ ...result, [item.referencedItemId]: item }),
        {}
      );
  }

  public async provide(): Promise<Diagrams> {
    await this._erdMainDiagramProvider.provide();
    const jsonSchemaMainDiagram = this._namesRegistry.diagrams.find(
      (diagram) => diagram.main === true && diagram.type === "treediagram"
    )!;
    const erdMainDiagram = this._namesRegistry.diagrams.find(
      (diagram) => diagram.main === true && diagram.type === "erd"
    )!;

    const tableDiagramItems = this.getTableDiagramItems();

    erdMainDiagram.diagramItems = {
      ...erdMainDiagram.diagramItems,
      ...tableDiagramItems
    };

    return {
      [erdMainDiagram.id]: erdMainDiagram,
      [jsonSchemaMainDiagram.id]: jsonSchemaMainDiagram
    };
  }
}
