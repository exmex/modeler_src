import { KnownIdRegistry } from "../../model/provider/KnownIdRegistry";
import { LayoutUpdateDiagrams } from "common";
import { ModelPartProvider } from "../../model/provider/ModelPartProvider";
import { NamesRegistry } from "../../model/NamesRegistry";
import _ from "lodash";

export class LayoutUpdateDiagramsProvider
  implements ModelPartProvider<LayoutUpdateDiagrams>
{
  public constructor(
    private _namesRegistry: NamesRegistry,
    private _knownIdRegistry: KnownIdRegistry
  ) {}

  private existingVisible(diagramId: string, diagramItemId: string): boolean {
    const mainDiagramId = this._knownIdRegistry.getMainDiagram()?.id;
    if (diagramId !== mainDiagramId) {
      return true;
    }

    const visibleObjects = _.filter(
      [...this._namesRegistry.tables, ...this._namesRegistry.otherObjects],
      (obj) => obj.visible
    );

    return !!_.find(visibleObjects, (vo) => vo.id === diagramItemId);
  }

  public provide(): Promise<LayoutUpdateDiagrams> {
    const mainDiagramId = this._knownIdRegistry.getMainDiagram()?.id;
    if (!mainDiagramId) {
      return Promise.resolve({});
    }

    const tableIds = _.map(
      this._knownIdRegistry.originalModel?.tables,
      (table) => table.id
    );
    const otherObjectIds = _.map(
      this._knownIdRegistry.originalModel?.otherObjects,
      (otherObject) => otherObject.id
    );

    const existingIds = _.reduce(
      [...tableIds, ...otherObjectIds],
      (r, id) => {
        if (!r.includes(id)) {
          return [...r, id];
        }
        return r;
      },
      []
    );

    const newVisibleTables = _.filter(
      this._namesRegistry.tables,
      (table) => table.visible && !existingIds.includes(table.id)
    );
    const newVisibleOtherObjects = _.filter(
      this._namesRegistry.otherObjects,
      (otherObject) =>
        otherObject.visible && !existingIds.includes(otherObject.id)
    );

    const newVisibleTablesIds = _.map(newVisibleTables, (table) => table.id);
    const newVisibleOtherObjectsIds = _.map(
      newVisibleOtherObjects,
      (otherObject) => otherObject.id
    );

    const newVisibleIds = [
      ...newVisibleTablesIds,
      ...newVisibleOtherObjectsIds
    ];

    const start = _.reduce(
      _.filter(this._knownIdRegistry.getAllDiagramItems(mainDiagramId), (di) =>
        this.existingVisible(mainDiagramId, di.referencedItemId)
      ),
      (r, di) => {
        return { x: 0, y: Math.max(r.y, di.y + di.gHeight) };
      },
      { x: 0, y: 0 }
    );

    return Promise.resolve({
      [mainDiagramId]: { ids: newVisibleIds, start }
    });
  }
}
