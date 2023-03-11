import { JSONTableObjectTypes } from "../JSONTableObjectTypes";
import { NamesRegistry } from "re";
import { v4 as uuidv4 } from "uuid";
import { Table } from "common";
import { JSONSchemaTableControlTypes } from "../JSONSchemaTableControlTypes";

export class ModelProvider {
  public constructor(private _namesRegistry: NamesRegistry) {}

  public createExternalRefTable(ref: string) {
    const newTable = {
      ...this.createTableStub(),
      name: ref,
      refUrl: ref,
      objectType: "ref",
      embeddable: true,
      visible: true,
      nodeType: JSONSchemaTableControlTypes.EXTERNAL_REF
    };
    this._namesRegistry.registerTable(newTable);
    return newTable.id;
  }

  public findExternalRefTable(ref: string): Table {
    for (const table of this._namesRegistry.tablesOfIds) {
      if (
        table.name === ref &&
        table.refUrl === ref &&
        table.objectType === "ref" &&
        table.embeddable === true &&
        table.visible === true
      ) {
        return table;
      }
    }
    return undefined;
  }

  public createTableStub(): any {
    return {
      id: uuidv4(),
      visible: false,
      name: "",
      desc: "",
      estimatedSize: "",
      cols: [],
      relations: [],
      lines: [],
      keys: [],
      indexes: [],
      embeddable: true,
      generate: true,
      generateCustomCode: true,
      objectType: JSONTableObjectTypes.OBJECT,
      nodeType: JSONSchemaTableControlTypes.STANDARD
    };
  }
}
