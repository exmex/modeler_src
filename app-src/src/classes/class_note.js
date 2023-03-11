import { v4 as uuidv4 } from "uuid";

export class ClassNote {
  constructor(id, name) {
    this.id = id || uuidv4();
    this.visible = true;
    this.name = name;
    this.desc = "";
    this.lines = [];
  }
}
