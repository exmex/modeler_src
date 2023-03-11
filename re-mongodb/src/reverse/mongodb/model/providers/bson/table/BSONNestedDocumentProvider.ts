import { BSONDocument } from "../../../../re/bson/BSONDocument";
import { ColumnsProvider } from "../../common/table/ColumnsProvider";
import { NamesRegistry } from "re";
import { Table } from "common";
import { v4 as uuidv4 } from "uuid";

export class BSONNestedDocumentProvider {
  constructor(private namesRegistry: NamesRegistry) {}

  public async provide(
    document: BSONDocument,
    columnsProvider: ColumnsProvider
  ): Promise<Table> {
    const result = {
      ...this.defaultvalues(),
      cols: await columnsProvider.provide(),
      embeddable: true,
      id: document.id,
      name: document.name
    };

    this.namesRegistry.registerTable(result);
    return result;
  }

  private defaultvalues(): Table {
    return {
      collation: "",
      desc: "",
      indexes: [],
      keys: [
        {
          id: uuidv4(),
          isPk: true,
          name: "Primary key",
          cols: []
        }
      ],
      others: "",
      relations: [],
      validationAction: "na",
      validationLevel: "na",
      visible: true,

      afterScript: "",
      charset: "",
      cols: [],
      database: "",
      embeddable: true,
      id: "",
      initautoinc: "",
      lines: [],
      name: "",
      paranoid: false,
      rowformat: "",
      tabletype: "",
      timestamps: false,
      version: false,
      generate: true,
      generateCustomCode: true,
      estimatedSize: ""
    };
  }
}
