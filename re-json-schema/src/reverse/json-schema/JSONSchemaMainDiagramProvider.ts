import { Diagram, Diagrams } from "common";
import { ModelPartProvider, NamesRegistry } from "re";

import { v4 as uuidv4 } from "uuid";

export class JSONSchemaMainDiagramProvider
  implements ModelPartProvider<Diagrams>
{
  public constructor(private _namesRegistry: NamesRegistry) {}

  public async provide(): Promise<Diagrams> {
    const mainDiagram: Diagram = {
      id: uuidv4(),
      lineColor: "transparent",
      description: "",
      diagramItems: {},
      isOpen: true,
      main: true,
      name: "TREE DIAGRAM",
      keysgraphics: true,
      linegraphics: "detailed",
      zoom: 1,
      background: "transparent",
      scroll: { x: 0, y: 0 },
      type: "treediagram"
    };
    this._namesRegistry.registerDiagram(mainDiagram);
    return { [mainDiagram.id]: mainDiagram };
  }
}
