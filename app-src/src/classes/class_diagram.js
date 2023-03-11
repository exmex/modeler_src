import { v4 as uuidv4 } from "uuid";

export class ClassDiagram {
  constructor(id, name, description, main) {
    this.name = name || "new diagram";
    this.description = description || "";
    this.id = id || uuidv4();
    this.keysgraphics = true;
    this.linegraphics = "detailed";
    this.zoom = 1;
    this.background = "transparent";
    this.lineColor = "transparent";
    this.isOpen = true;
    this.main = main;
    this.diagramItems = {};
    this.scroll = { x: 0, y: 0 };
    this.type = "erd";
  }
}
