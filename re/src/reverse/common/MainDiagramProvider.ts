import { Diagram, Diagrams } from "common";

import { KnownIdRegistry } from "../..";
import { ModelPartProvider } from "../../model/provider/ModelPartProvider";
import { NamesRegistry } from "../../model/NamesRegistry";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";

export class MainDiagramProvider implements ModelPartProvider<Diagrams> {
  public constructor(
    private _namesRegistry: NamesRegistry,
    private _knownIdRegistry: KnownIdRegistry
  ) {}

  public async provide(): Promise<Diagrams> {
    const originalMainDiagram = this._knownIdRegistry.getMainDiagram();
    if (!!originalMainDiagram) {
      const newMainDiagram = { ...originalMainDiagram, diagramItems: {} };
      this._namesRegistry.registerDiagram(newMainDiagram);

      const newNotMainDiagrams = _.reduce(
        this._knownIdRegistry.getNotMainDiagrams(),
        (r, diagram) => {
          const newDiagram = {
            ...diagram,
            diagramItems: {}
          };

          this._namesRegistry.registerDiagram(newDiagram);
          return {
            ...r,
            [diagram.id]: newDiagram
          };
        },
        {}
      );

      const mainDiagram = {
        [originalMainDiagram.id]: newMainDiagram,
        ...newNotMainDiagrams
      };
      return mainDiagram;
    }
    const mainDiagram: Diagram = {
      id: uuidv4(),
      lineColor: "transparent",
      description: "",
      diagramItems: {},
      isOpen: true,
      main: true,
      name: "Main Diagram",
      keysgraphics: true,
      linegraphics: "detailed",
      zoom: 1,
      background: "transparent",
      scroll: { x: 0, y: 0 },
      type: "erd"
    };
    this._namesRegistry.registerDiagram(mainDiagram);
    return { [mainDiagram.id]: mainDiagram };
  }
}
