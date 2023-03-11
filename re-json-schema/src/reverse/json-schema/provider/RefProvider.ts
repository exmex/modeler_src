import { DefinitionsRegistry } from "./DefinitionsRegistry";
import { ModelProvider } from "./ModelProvider";
import _ from "lodash";

export class RefProvider {
  public constructor(
    private _definitionsRegistry: DefinitionsRegistry,
    private _modelProvider: ModelProvider
  ) {}

  public getOrCreateRef(
    rootSchemaTableId: string,
    property: any,
    defTableId: string
  ): {
    id?: string;
    specialRef?: string;
    specRef?: any;
    refUseSchemaId?: boolean;
  } {
    if (!!property.$recursiveRef && _.isString(property.$recursiveRef)) {
      return this.extractRecursiveDynamicReference(
        property,
        rootSchemaTableId,
        "$recursiveRef"
      );
    } else if (!!property.$dynamicRef && _.isString(property.$dynamicRef)) {
      return this.extractRecursiveDynamicReference(
        property,
        rootSchemaTableId,
        "$dynamicRef"
      );
    } else if (!!property.$ref && _.isString(property.$ref)) {
      return this.extractRefTypeReference(
        property,
        rootSchemaTableId,
        "$ref",
        defTableId
      );
    }
    return {};
  }

  private extractRefTypeReference(
    property: any,
    rootSchemaTableId: string,
    propertyName: string,
    defTableId: string
  ) {
    const foundRef = this._definitionsRegistry.findDef(
      property[propertyName],
      rootSchemaTableId,
      propertyName
    );

    if (foundRef) {
      if (foundRef.isExternal) {
        const ref = property[propertyName];
        const externalRefTable = this._modelProvider.findExternalRefTable(ref);
        return {
          id: !!externalRefTable
            ? externalRefTable.id
            : this._modelProvider.createExternalRefTable(ref)
        };
      } else {
        const noCycleFound =
          foundRef.tableId &&
          this._definitionsRegistry.addRef(foundRef.tableId, defTableId);
        if (
          foundRef.tableId &&
          foundRef.tableId !== rootSchemaTableId &&
          !foundRef.isOtherSchemaFragment &&
          noCycleFound
        ) {
          return {
            id: foundRef.tableId,
            refUseSchemaId: foundRef.isAbsoluteURI
          };
        } else {
          return { specialRef: property[propertyName] };
        }
      }
    }
    return {};
  }

  private extractRecursiveDynamicReference(
    property: any,
    rootSchemaTableId: string,
    propertyName: string
  ) {
    const foundRecursiveRef = this._definitionsRegistry.findDef(
      property[propertyName],
      rootSchemaTableId,
      propertyName
    );
    if (!!foundRecursiveRef) {
      return { specRef: { [propertyName]: property[propertyName] } };
    }
    return {};
  }

  public isRef(property: any) {
    return (
      (property?.$ref && _.isString(property?.$ref)) ||
      (property?.$recursiveRef && _.isString(property?.$recursiveRef)) ||
      (property?.$dynamicRef && _.isString(property?.$dynamicRef))
    );
  }
}
