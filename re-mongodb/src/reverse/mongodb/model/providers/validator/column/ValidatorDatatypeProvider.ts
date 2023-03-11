import { NamesRegistry } from "re";
import { NestedDocumentStructureRegistry } from "../../common/NestedDocumentStructureRegistry";
import { NestedValidatorProvider } from "../table/NestedValidatorProvider";
import { ValidatorColumnsProvider } from "./ValidatorColumnsProvider";
import { ValidatorNestedDocumentProvider } from "../table/ValidatorNestedDocumentProvider";
import _ from "lodash";

export class ValidatorDatatypeProvider {
  public constructor(
    private nestedDocumentProvider: ValidatorNestedDocumentProvider,
    private nestedDocumentStructureRegistry: NestedDocumentStructureRegistry,
    private namesRegistry: NamesRegistry
  ) {}
  public async provide(propName: string, prop: any): Promise<string> {
    const isEnum = prop.enum;
    if (isEnum) {
      return "enum";
    }

    const isArray =
      (prop.bsonType === "array" || prop.type === "array") &&
      (!prop.items || Array.isArray(prop.items));
    if (isArray) {
      return "array";
    }

    const activeObjectProp =
      prop.bsonType === "array" || prop.type === "array" ? prop.items : prop;

    const isObject =
      activeObjectProp.bsonType === "object" ||
      activeObjectProp.type === "object";

    const isArrayOfObjects =
      !!prop.items &&
      (prop.bsonType === "array" || prop.type === "array") &&
      (prop.items?.type === "object" ||
        (!prop.items.type &&
          (!prop.items.bsonType || prop.items?.bsonType === "object")) ||
        prop.items?.bsonType === "object" ||
        (!prop.items.bsonType &&
          (!prop.items.type || prop.items?.type === "object")));

    const isNestedObject = isObject || isArrayOfObjects;

    if (isNestedObject) {
      const subDocument = await this.nestedDocumentProvider.provide(
        propName,
        activeObjectProp,
        new ValidatorColumnsProvider(activeObjectProp, this, false),
        new NestedValidatorProvider(activeObjectProp)
      );
      this.nestedDocumentStructureRegistry.register(subDocument);
      this.namesRegistry.registerTable(subDocument);
      return subDocument.id;
    }

    if (activeObjectProp.bsonType && Array.isArray(activeObjectProp.bsonType)) {
      return "undefined";
    }

    if (activeObjectProp.type && Array.isArray(activeObjectProp.type)) {
      return "undefined";
    }

    if (activeObjectProp.bsonType === "number") {
      return "double";
    }

    if (activeObjectProp.type === "number") {
      return "double";
    }

    if (activeObjectProp.type) {
      return activeObjectProp.type;
    }

    if (activeObjectProp.bsonType) {
      return activeObjectProp.bsonType;
    }

    return "undefined";
  }
}
