import { Diagram, DiagramItem, DiagramItems, Diagrams } from "common";

import { DiagramItemColorProvider } from "./DiagramItemColorProvider";
import { KnownIdRegistry } from "../../model/provider/KnownIdRegistry";
import { ModelPartProvider } from "../../model/provider/ModelPartProvider";
import { NamesRegistry } from "../../model/NamesRegistry";
import _ from "lodash";

export class MainDiagramItemsProvider implements ModelPartProvider<Diagrams> {
  public constructor(
    protected _namesRegistry: NamesRegistry,
    private _diagramItemColorProvider: DiagramItemColorProvider,
    private _knownIdRegistry: KnownIdRegistry
  ) {}

  protected getTableDiagramItems(diagramId: string) {
    return this._namesRegistry.tablesOfIds
      .sort((a, b) => Number(a.embeddable) - Number(b.embeddable))
      .map((table): DiagramItem => {
        const originalDiagramItem = this._knownIdRegistry.getDiagramItem(
          diagramId,
          table.id
        );
        if (!!originalDiagramItem) {
          return originalDiagramItem;
        }
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

  protected getOtherObjectDiagramItems(diagramId: string) {
    return this._namesRegistry.otherObjectsOfIds
      .map((otherObject): DiagramItem => {
        const originalDiagramItem = this._knownIdRegistry.getDiagramItem(
          diagramId,
          otherObject.id
        );
        if (!!originalDiagramItem) {
          return originalDiagramItem;
        }
        const colors =
          this._diagramItemColorProvider.getOtherObjectColor(otherObject);
        return {
          x: 0,
          y: 0,
          gHeight: 0,
          gWidth: 0,
          background: colors.background,
          color: colors.color,
          referencedItemId: otherObject.id,
          resized: false,
          autoExpand: true
        };
      })
      .reduce(
        (result, item) => ({ ...result, [item.referencedItemId]: item }),
        {}
      );
  }

  protected getNoteDiagramItems(diagramId: string): DiagramItems {
    const noteDiagramItems =
      this._knownIdRegistry.originalModel?.diagrams[diagramId]?.diagramItems;
    const newDiagramItemNotes = this._namesRegistry.notesOfIds.map(
      (note): DiagramItem => ({ ...noteDiagramItems[note.id] })
    );

    return _.reduce(
      newDiagramItemNotes,
      (result, item) => ({ ...result, [item.referencedItemId]: item }),
      {}
    );
  }

  private getMainDiagram(): Diagram {
    const mainDiagram = this._namesRegistry.diagrams.find(
      (diagram) => diagram.main
    );

    const tableDiagramItems = this.getTableDiagramItems(mainDiagram.id);
    const otherObjectDiagramItems = this.getOtherObjectDiagramItems(
      mainDiagram.id
    );
    const noteDiagramItems = this.getNoteDiagramItems(mainDiagram.id);

    mainDiagram.diagramItems = {
      ...mainDiagram.diagramItems,
      ...tableDiagramItems,
      ...otherObjectDiagramItems,
      ...noteDiagramItems
    };

    return mainDiagram;
  }

  private getNotMainDiagrams(): Diagrams {
    const notMainDiagrams = _.filter(
      this._knownIdRegistry.originalModel?.diagrams,
      (diagram) => !diagram.main
    );

    return _.reduce(
      notMainDiagrams,
      (r, diagram) => {
        const newDiagramItems = _.reduce(
          diagram.diagramItems,
          (r1, diagramItem) => {
            if (
              !!this._namesRegistry.tableById(diagramItem.referencedItemId) ||
              !!this._namesRegistry.otherObjectById(
                diagramItem.referencedItemId
              ) ||
              !!this._namesRegistry.noteById(diagramItem.referencedItemId)
            )
              return {
                ...r1,
                [diagramItem.referencedItemId]: diagramItem
              };
            return r1;
          },
          {}
        );
        return {
          ...r,
          [diagram.id]: { ...diagram, diagramItems: newDiagramItems }
        };
      },
      {}
    );
  }

  public async provide(): Promise<Diagrams> {
    const mainDiagram = this.getMainDiagram();
    const notMainDiagrams = this.getNotMainDiagrams();
    return { [mainDiagram.id]: mainDiagram, ...notMainDiagrams };
  }
}
