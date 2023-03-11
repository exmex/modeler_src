import { Column, Key, KeyCol, OtherObjects, Table, Tables } from "common";
import {
  FakeIdGraphQLColumn,
  FieldGraphQLColumnAdapter,
  GraphQLColumn
} from "../GraphQLColumn";
import {
  Field,
  GraphQLSchemaParser,
  Type
} from "../../../../db/graphql/GraphQLSchemaParser";
import { ModelPartProvider, NamesRegistry } from "re";

import { v4 as uuidv4 } from "uuid";

const QUERY = "Query";
const MUTATION = "Mutation";

export class GraphQLTablesProvider
  implements ModelPartProvider<{ tables: Tables; otherObjects: OtherObjects }>
{
  public constructor(
    private parser: GraphQLSchemaParser,
    private namesRegistry: NamesRegistry
  ) {}

  public async provide(): Promise<{
    tables: Tables;
    otherObjects: OtherObjects;
  }> {
    const tables: Tables = {};
    const otherObjects: OtherObjects = {};
    this.getInput(tables);
    this.getInterface(tables);
    this.getTypes(tables);
    this.getUnion(tables);
    return { tables, otherObjects };
  }

  private getTypes(tables: Tables): void {
    this.parser
      .getTypes()
      .filter((typ) => this.isNotQueryOrMutation(typ))
      .forEach((typ): void => {
        const id = this.namesRegistry.registerName(typ.name);
        const newType = this.createTypeInputUnion(
          id,
          typ.name,
          typ.description,
          typ.fields,
          typ.directive,
          "type"
        );
        tables[newType.id] = newType;
        this.namesRegistry.registerTable(newType);
      });
  }

  private isNotQueryOrMutation(typ: Type): unknown {
    return typ.name !== QUERY && typ.name !== MUTATION;
  }

  private getInterface(tables: Tables): void {
    this.parser.getInterfaces().forEach((inter): void => {
      const id = this.namesRegistry.registerName(inter.name);
      const newInter = this.createInterface(
        id,
        inter.name,
        inter.description,
        inter.fields,
        inter.directive
      );
      tables[newInter.id] = newInter;
      this.namesRegistry.registerTable(newInter);
    });
  }

  private getInput(tables: Tables): void {
    this.parser.getInputs().forEach((input): void => {
      const id = this.namesRegistry.registerName(input.name);
      const newInput = this.createTypeInputUnion(
        id,
        input.name,
        input.description,
        input.fields,
        input.directive,
        "input"
      );
      tables[newInput.id] = newInput;
      this.namesRegistry.registerTable(newInput);
    });
  }

  private getUnion(result: Tables): void {
    this.parser.getUnions().forEach((union): void => {
      const id = this.namesRegistry.registerName(union.name);
      const newUnion = this.createTypeInputUnion(
        id,
        union.name,
        union.description,
        [],
        union.directive,
        "union"
      );
      result[newUnion.id] = newUnion;
      this.namesRegistry.registerTable(newUnion);
    });
  }

  private addFakeId(): Column {
    return this.addColumn(new FakeIdGraphQLColumn());
  }

  private addColumn(column: GraphQLColumn): Column {
    return {
      name: column.name,
      datatype: column.datatype,
      pk: column.pk,
      nn: column.nn,
      list: column.list,
      isHidden: column.isHidden,
      fieldArguments: column.fieldArguments,
      fieldDirective: column.fieldDirective,
      comment: column.comment,
      id: uuidv4(),
      data: "",
      param: "",
      isArrayItemNn: false,
      after: "",
      autoinc: false,
      charset: "",
      collation: "",
      defaultvalue: "",
      enum: "",
      unsigned: false,
      zerofill: false,
      estimatedSize: ""
    };
  }

  private getColumns(fields: Field[]): Column[] {
    const result: Column[] = [];
    const fakeId = this.addFakeId();
    result.push(fakeId);

    fields.forEach((field: Field): void => {
      const dataTypeLink = this.registerNotDefaultType(field.datatype);
      const col = this.addColumn(
        new FieldGraphQLColumnAdapter(field, dataTypeLink, false)
      );
      result.push(col);
    });

    return result;
  }

  private registerNotDefaultType(name: string): string {
    return this.namesRegistry.registerName(name);
  }

  private getInterfaceColumns(fields: Field[]): Column[] {
    const result: Column[] = [];
    const fakeId = this.addFakeId();
    result.push(fakeId);

    fields.forEach((field: Field): void => {
      const dataTypeLink = this.registerNotDefaultType(field.datatype);
      const col = this.addColumn(
        new FieldGraphQLColumnAdapter(field, dataTypeLink, true)
      );
      result.push(col);
    });

    return result;
  }

  private getKeys(cols: Column[]): Key[] {
    return [
      {
        id: uuidv4(),
        name: "Identifier",
        isPk: true,
        cols: [
          {
            id: uuidv4(),
            colid: cols[0].id
          }
        ]
      }
    ];
  }

  private getInterfaceKeys(cols: Column[]): Key[] {
    return [
      {
        id: uuidv4(),
        name: "Identifier",
        isPk: true,
        cols: cols.map((col): KeyCol => ({ id: uuidv4(), colid: col.id }))
      }
    ];
  }

  private createTypeInputUnion(
    id: string,
    name: string,
    desc: string,
    fields: Field[],
    directive: string,
    objectType: string
  ): Table {
    const cols = this.getColumns(fields);
    return {
      id,
      name,
      embeddable: false,
      visible: true,
      desc,
      cols,
      relations: [],
      lines: [],
      keys: this.getKeys(cols),
      indexes: [],
      objectType,
      directive,

      afterScript: "",
      charset: "",
      database: "",
      initautoinc: "",
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

  private createInterface(
    id: string,
    name: string,
    desc: string,
    fields: Field[],
    directive: string
  ): Table {
    const cols = this.getInterfaceColumns(fields);
    return {
      id,
      name,
      embeddable: false,
      visible: true,
      desc,
      cols,
      relations: [],
      lines: [],
      keys: this.getInterfaceKeys(cols),
      indexes: [],
      objectType: "interface",
      directive,

      afterScript: "",
      charset: "",
      database: "",
      initautoinc: "",
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
