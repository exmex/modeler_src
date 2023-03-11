import { DiagramItemColor, DiagramItemColorProvider } from "re";

import { DefinitionsRegistry } from "./DefinitionsRegistry";
import { Table } from "common";

const DEF_COLORS = {
  background: "#8bc34a",
  color: "#ffffff"
};

const SCHEMA_ROOT_COLORS = {
  background: "#03a9f4",
  color: "#ffffff"
};

const INVISIBLE_COLORS = {
  background: "transparent",
  color: "transparent"
};

export class JSONSchemaDiagramItemColorProvider
  implements DiagramItemColorProvider
{
  public constructor(private _definitionsRegistry: DefinitionsRegistry) {}

  public getTableColor(table: Table): DiagramItemColor {
    return this.isVisibleTables(table)
      ? this.visibleTableColors(table)
      : this.invisibleTableColors();
  }

  private visibleTableColors(table: Table): DiagramItemColor {
    return this.isDef(table) || this.isRef(table)
      ? DEF_COLORS
      : SCHEMA_ROOT_COLORS;
  }

  private invisibleTableColors(): DiagramItemColor {
    return INVISIBLE_COLORS;
  }

  private isDef(table: Table) {
    return table.embeddable === true;
  }

  private isRef(table: Table) {
    return table.nodeType === "external_ref";
  }

  private isVisibleTables(table: Table) {
    return this._definitionsRegistry.isDef(table.id) || this.isRef(table);
  }

  public getOtherObjectColor(): DiagramItemColor {
    return INVISIBLE_COLORS;
  }
}
