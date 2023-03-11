import { JSONTableObjectTypes } from "../JSONTableObjectTypes";
import { SchemaProvider } from "./SchemaProvider";
import _ from "lodash";

export class PropertyTypeProvider {
  public constructor(private _schemaProvider: SchemaProvider) {}

  public getPropertyType(
    property: any,
    propertyName: string,
    isArrayItem: boolean,
    isRoot: boolean,
    path: string[]
  ) {
    return this.getPropertyType1(
      property,
      propertyName,
      isArrayItem,
      isRoot,
      path
    );
  }

  public getPropertyType1(
    property: any,
    propertyName: string,
    isArrayItem: boolean,
    isRoot: boolean,
    path: string[]
  ): string {
    if (
      this._schemaProvider.isJSONSchema() &&
      this.isControlProperty([...path, propertyName])
    ) {
      return _.isString(property.type)
        ? property.type
        : _.isArray(property)
        ? JSONTableObjectTypes.KEYARRAY
        : JSONTableObjectTypes.KEYOBJECT;
    } else if (
      !property.type &&
      this._schemaProvider.isOpenAPIJSONSchema([...path, propertyName]) &&
      ![
        "properties",
        "patternProperties",
        "anyOf",
        "allOf",
        "oneOf",
        "if",
        "then",
        "else",
        "not"
      ].includes(propertyName)
    ) {
      return JSONTableObjectTypes.ANY;
    } else if (isRoot) {
      return property.type || JSONTableObjectTypes.ANY;
    } else if (property === null) {
      return JSONTableObjectTypes.NULL;
    } else if (property.enum && _.isArray(property.enum)) {
      return property.type || JSONTableObjectTypes.ANY;
    } else if (
      property.type &&
      _.isString(property.type) &&
      (this._schemaProvider.isJSONSchema() ||
        this._schemaProvider.isOpenAPIJSONSchema([...path, propertyName]))
    ) {
      return property.type;
    } else if (isArrayItem) {
      return JSONTableObjectTypes.ANY;
    } else if (
      (property.$ref && _.isString(property.$ref)) ||
      (property.$recursiveRef && _.isString(property.$recursiveRef)) ||
      (property.$dynamicRef && _.isString(property.$dynamicRef))
    ) {
      return JSONTableObjectTypes.OBJECT;
    } else if (Array.isArray(property)) {
      return this.getPropertyTypeArray(propertyName);
    } else if (typeof property === "object") {
      if (this.getLast(path) === "properties") {
        return JSONTableObjectTypes.ANY;
      }
      return this.getPropertyTypeObject(propertyName);
    }

    return JSONTableObjectTypes.KEYOBJECT;
  }

  private getPreLast(path: string[]): string {
    if (path.length > 1) {
      return path[path.length - 2];
    }
    return undefined;
  }

  private getLast(path: string[]): string {
    if (path.length > 0) {
      return path[path.length - 1];
    }
    return undefined;
  }

  private isControlProperty(path: string[]): boolean {
    const last = this.getLast(path);
    const preLast = this.getPreLast(path);
    if (!!last && !!preLast) {
      if (last === "properties" && preLast === "properties") {
        return false;
      }
      if (last === "patternProperties" && preLast === "properties") {
        return false;
      }
      if (last === "items" && preLast === "properties") {
        return false;
      }
      if (last === "properties" && preLast === "items") {
        return true;
      }
    }
    if (!!last) {
      return ["properties", "patternProperties", "items"].includes(last);
    }
    return false;
  }

  public getPropertyTypeArray(propertyName: string) {
    switch (propertyName) {
      case JSONTableObjectTypes.ANYOF:
        return JSONTableObjectTypes.ANYOF;
      case JSONTableObjectTypes.ALLOF:
        return JSONTableObjectTypes.ALLOF;
      case JSONTableObjectTypes.ONEOF:
        return JSONTableObjectTypes.ONEOF;
      default:
        return JSONTableObjectTypes.KEYARRAY;
    }
  }

  public getPropertyTypeObject(propertyName: string) {
    switch (propertyName) {
      case JSONTableObjectTypes.NOT:
        return JSONTableObjectTypes.NOT;
      case JSONTableObjectTypes.IF:
        return JSONTableObjectTypes.ANY;
      case JSONTableObjectTypes.THEN:
        return JSONTableObjectTypes.ANY;
      case JSONTableObjectTypes.ELSE:
        return JSONTableObjectTypes.ANY;
    }
    return JSONTableObjectTypes.KEYOBJECT;
  }
}
