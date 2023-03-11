import { JSONTableObjectTypes } from "../JSONTableObjectTypes";
import { SchemaProvider } from "./SchemaProvider";
import _ from "lodash";

export class DiagramVisualization {
  public constructor(private _schemaProvider: SchemaProvider) {}
  public isSpecificationProperty(
    type: string,
    property: any,
    propertyName: string,
    isRoot: boolean,
    isDef: boolean,
    path: string[]
  ): boolean {
    const propertyValue = property[propertyName];
    if (
      this.isDependentRequiredDirective(propertyName) ||
      this.isExamplesObject(propertyName, propertyValue, type) ||
      this.isDefaultObject(propertyName, propertyValue, type) ||
      this.isEnumArray(propertyName, propertyValue)
    ) {
      return true;
    }
    if (
      this.isStringRequiredArray(propertyName, propertyValue) ||
      this.isSchemaDirective(isRoot, propertyName, propertyValue) ||
      this.isTypeDirective(propertyName, propertyValue, path) ||
      this.isDescriptionDirective(propertyName, propertyValue) ||
      (this.isRefDirective(propertyName, propertyValue) && !isRoot) ||
      (this.isRefDirective(propertyName, propertyValue) && !isDef) ||
      this.isRecursiveRefDirective(propertyName, propertyValue) ||
      this.isDynamicRefDirective(propertyName, propertyValue) ||
      this.isNotArrayOrObject(propertyValue) ||
      this.isObjectorArrayArray(propertyValue) ||
      this.isAdditionalProperties(propertyName) ||
      this.isOpenAPISchemaProperty(propertyName)
    ) {
      return false;
    }

    return true;
  }

  public isVisualizedOnDiagram(
    type: string,
    propertyName: string,
    property: any,
    isRoot: boolean
  ): boolean {
    const propertyValue = property[propertyName];
    if (
      this.isRootDefsOrDefinitionDirective(
        propertyName,
        isRoot,
        propertyValue
      ) ||
      this.isDependentRequiredDirective(propertyName) ||
      this.isEnumOfAtomicValues(propertyName, propertyValue) ||
      this.isStringRequiredArray(propertyName, propertyValue) ||
      this.isArrayOfAtomicValues(propertyValue) ||
      this.isEmptyArray(propertyValue) ||
      _.isNull(propertyValue) ||
      //this.isEmptyObject(propertyValue) ||
      this.isExamplesObject(propertyName, propertyValue, type) ||
      this.isDefaultObject(propertyName, propertyValue, type) ||
      this.isEnumArray(propertyName, propertyValue)
    ) {
      return false;
    }
    return (
      this.isObject(property, propertyName) ||
      this.isAdditionalProperties(propertyName)
    );
  }

  private isObject(property: any, propertyName: string): boolean {
    return typeof property[propertyName] === "object";
  }

  private isExamplesObject(
    propertyName: string,
    propertyValue: any,
    type: string
  ) {
    return (
      type !== JSONTableObjectTypes.KEYOBJECT && propertyName === "examples"
    );
  }

  private isDefaultObject(
    propertyName: string,
    propertyValue: any,
    type: string
  ) {
    return (
      type !== JSONTableObjectTypes.KEYOBJECT && propertyName === "default"
    );
  }

  private isEnumArray(propertyName: string, propertyValue: any) {
    return _.isArray(propertyValue) && propertyName === "enum";
  }

  private isEmptyArray(propertyValue: any) {
    return Array.isArray(propertyValue) && _.size(propertyValue) === 0;
  }

  private isArrayOfAtomicValues(propertyValue: any) {
    return Array.isArray(propertyValue) && !_.every(propertyValue, _.isObject);
  }

  private isEnumOfAtomicValues(propertyName: string, propertyValue: any) {
    return (
      propertyName === "enum" &&
      Array.isArray(propertyValue) &&
      !_.every(propertyValue, _.isObject)
    );
  }

  private isRootDefsOrDefinitionDirective(
    propertyName: string,
    isRoot: boolean,
    propertyValue: any
  ) {
    return (
      !this._schemaProvider.isOpenAPI() &&
      (propertyName === "$defs" || propertyName === "definitions") &&
      isRoot
    );
  }

  private isDependentRequiredDirective(propertyName: string) {
    return propertyName === "dependentRequired";
  }

  private isStringRequiredArray(propertyName: string, propertyValue: any) {
    return (
      propertyName === "required" &&
      Array.isArray(propertyValue) &&
      _.every(propertyValue, _.isString)
    );
  }

  private isDynamicRefDirective(propertyName: string, propertyValue: any) {
    return propertyName === "$dynamicRef" && _.isString(propertyValue);
  }

  private isRecursiveRefDirective(propertyName: string, propertyValue: any) {
    return propertyName === "$recursiveRef" && _.isString(propertyValue);
  }

  private isRefDirective(propertyName: string, propertyValue: any) {
    return propertyName === "$ref" && _.isString(propertyValue);
  }

  private isDescriptionDirective(propertyName: string, propertyValue: any) {
    return propertyName === "description" && _.isString(propertyValue);
  }

  private isTypeDirective(
    propertyName: string,
    propertyValue: any,
    path: string[]
  ) {
    return (
      (this._schemaProvider.isJSONSchema() ||
        (this._schemaProvider.isOpenAPI() &&
          this._schemaProvider.isOpenAPIJSONSchema([...path, propertyName]))) &&
      propertyName === "type" &&
      _.isString(propertyValue) &&
      [
        JSONTableObjectTypes.BOOLEAN.toString(),
        JSONTableObjectTypes.STRING.toString(),
        JSONTableObjectTypes.NULL.toString(),
        JSONTableObjectTypes.NUMBER.toString(),
        JSONTableObjectTypes.INTEGER.toString(),
        JSONTableObjectTypes.OBJECT.toString(),
        JSONTableObjectTypes.ARRAY.toString()
      ].includes(propertyValue)
    );
  }

  private isSchemaDirective(
    isRoot: boolean,
    propertyName: string,
    propertyValue: any
  ) {
    return isRoot && propertyName === "$schema" && _.isString(propertyValue);
  }

  private isObjectorArrayArray(propertyValue: any) {
    return (
      _.isArray(propertyValue) &&
      _.size(propertyValue) > 0 &&
      (_.every(propertyValue, _.isObject) || _.every(propertyValue, _.isArray))
    );
  }

  private isNotArrayOrObject(propertyValue: any) {
    return !_.isArray(propertyValue) && _.isObject(propertyValue);
  }

  private isAdditionalProperties(propertyName: string) {
    return propertyName === "additionalProperties";
  }

  private isOpenAPISchemaProperty(propertyName: string) {
    return (
      this._schemaProvider.isOpenAPI() &&
      (propertyName === "swagger" || propertyName === "openapi")
    );
  }
}
