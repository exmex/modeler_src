import { ColumnsProvider } from "../../common/table/ColumnsProvider";
import { NestedValidatorProvider } from "./NestedValidatorProvider";
import { Table } from "common";
import { v4 as uuidv4 } from "uuid";

export class ValidatorNestedDocumentProvider {
  public async provide(
    propName: string,
    schema: any,
    columnsProvider: ColumnsProvider,
    validatorProvider: NestedValidatorProvider
  ): Promise<Table> {
    return {
      ...this.defaultvalues(),
      cols: await columnsProvider.provide(),
      embeddable: true,
      id: uuidv4(),
      name: schema.title ?? propName,
      desc: schema.description ?? "",
      validation: validatorProvider.provide()
    };
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
