import { Column } from "common";
import { ColumnsProvider } from "../../common/table/ColumnsProvider";
import { ValidationParser } from "../ValidationParser";
import { ValidatorDatatypeProvider } from "./ValidatorDatatypeProvider";
import { v4 as uuidv4 } from "uuid";

export class ValidatorColumnsProvider implements ColumnsProvider {
  public constructor(
    private schema: any,
    private datatypeProvider: ValidatorDatatypeProvider,
    private root: boolean
  ) {}

  public async provide(): Promise<Column[]> {
    const resultPropertiesPromises: Promise<Column>[] =
      this.schema && this.schema.properties
        ? Object.keys(this.schema.properties).map((key) =>
            this.createColumn(key, false)
          )
        : [];

    const resultPatternPropertiesPromises: Promise<Column>[] =
      this.schema && this.schema.patternProperties
        ? Object.keys(this.schema.patternProperties).map((key) =>
            this.createColumn(key, true)
          )
        : [];

    const resultProperties = await Promise.all(resultPropertiesPromises);
    const resultPatternProperties = await Promise.all(
      resultPatternPropertiesPromises
    );
    const result = [...resultProperties, ...resultPatternProperties];

    const idNotExists = !!result.find((col) => col.name === "_id");
    return this.root === true && !idNotExists
      ? [this.createIdColumn(), ...result]
      : result;
  }

  private createIdColumn(): Column {
    return {
      ...this.columnDefault(),
      datatype: "objectId",
      id: uuidv4(),
      name: "_id",
      nn: true,
      pk: true
    };
  }

  private isRootId(propertyName: string) {
    return this.root && propertyName === "_id";
  }

  private isRequired(requiredArray: string[], propertyName: string): boolean {
    const isRequired = requiredArray
      ? requiredArray.includes(propertyName)
      : false;
    return isRequired || this.isRootId(propertyName);
  }

  private isList(prop: any) {
    return (
      (prop.type === "array" || prop.bsonType === "array") &&
      !Array.isArray(prop.items) &&
      !!prop.items
    );
  }

  private async createColumn(name: string, pattern: boolean): Promise<Column> {
    const prop = this.getProp(name, pattern);

    return Promise.resolve({
      ...this.columnDefault(),
      datatype: await this.datatypeProvider.provide(name, prop),
      id: uuidv4(),
      comment: prop.description,
      list: this.isList(prop),
      name,
      nn: this.isRequired(this.schema.required, name),
      validation: new ValidationParser({
        ...prop,
        bsonType: undefined,
        type: undefined,
        enum: undefined,
        items: undefined,
        additionalItems: undefined,
        properties: undefined,
        additionalProperties: undefined,
        title: undefined,
        description: undefined
      }).parse(),
      pk: this.isRootId(name),
      enum: this.getEnu(prop),
      pattern
    });
  }

  private getProp(name: string, pattern: boolean): any {
    return pattern === true
      ? this.schema.patternProperties[name]
      : this.schema.properties[name];
  }

  private getEnu(prop: any) {
    return prop.enum ? JSON.stringify(prop.enum) : "";
  }

  private columnDefault() {
    return {
      data: "",
      param: "",
      pk: false,
      after: "",
      autoinc: false,
      charset: "",
      collation: "",
      enum: "",
      defaultvalue: "",
      unsigned: false,
      zerofill: false,
      isHidden: false,
      comment: "",
      list: false,
      nn: false,
      validation: "",
      estimatedSize: ""
    };
  }
}
