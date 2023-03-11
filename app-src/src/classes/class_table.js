import { v4 as uuidv4 } from "uuid";

export class ClassTable {
  constructor(id, name, cols, keys, embeddable) {
    this.id = id || uuidv4();
    this.visible = true;
    this.name = name || "new";
    this.desc = "";
    this.estimatedSize = "";
    this.cols = cols || [];
    this.relations = [];
    this.lines = [];
    this.keys = keys || [
      {
        id: uuidv4(),
        name: "Primary key",
        isPk: true,
        cols: []
      }
    ];
    this.indexes = [];
    this.embeddable = embeddable || false;
    this.generate = true;
    this.generateCustomCode = true;
  }
}

export const TableObjectTypes = {
  TABLE: "table",
  TYPE: "type",
  INTERFACE: "interface",
  UNION: "union",
  COMPOSITE: "composite",
  INPUT: "input"
};
