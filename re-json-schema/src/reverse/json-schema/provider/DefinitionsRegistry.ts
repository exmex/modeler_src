import { NamesRegistry } from "re";
import URI from "urijs";
import _ from "lodash";

export class Definition {
  public constructor(
    public name: string,
    public id: string,
    public tableId: string,
    public schemaRootTableId: string
  ) {}
}

export class Ref {
  public constructor(
    public tableId: string,
    public type: string,
    public isExternal: boolean,
    public isOtherSchemaFragment: boolean,
    public isAbsoluteURI: boolean
  ) {}
}

export class DefinitionsRegistry {
  private baseURI: URI;
  private defs: Definition[] = [];
  private refs: { [targetTableId: string]: string[] } = {};

  public isDef(tableId: string) {
    return !!_.find(this.defs, (def) => def.tableId === tableId);
  }

  public isRef(tableId: string) {
    return !!this.refs[tableId];
  }

  public buildAbsoluteURI($id: string): string {
    try {
      const idURI = URI($id);
      if (!idURI.protocol() && !idURI.hostname()) {
        const port = this.baseURI.port() ? `:${this.baseURI.port()}` : ``;
        return `${this.baseURI.protocol()}://${this.baseURI.hostname()}${port}${idURI.path()}`;
      }
      return $id;
    } catch {
      return $id;
    }
  }

  public addDef(
    name: string,
    id: string,
    tableId: string,
    schemaRootTableId: string
  ) {
    this.defs.push(new Definition(name, id, tableId, schemaRootTableId));
  }

  public setBaseURI(id: string) {
    try {
      this.baseURI = URI(id);
    } catch {
      this.baseURI = undefined;
    }
  }

  public findDef(
    ref: string,
    schemaRootTableId: string,
    type: string
  ): Ref | undefined {
    if (
      type === "$recursiveRef" ||
      type === "$dynamicRef" ||
      (type === "$ref" && ref === "#")
    ) {
      return new Ref(schemaRootTableId, type, false, false, false);
    } else if (type === "$ref") {
      return this.findRef(ref, type, schemaRootTableId);
    }
    return undefined;
  }

  private findRef(ref: string, type: string, schemaRootTableId: string) {
    const refURI = URI(ref);
    if (this.isAbsoluteURI(this.baseURI) && !this.isOnlyFragmentRI(refURI)) {
      return this.findDefAbsoluteNotFragment(refURI, schemaRootTableId, type);
    }
    return this.findDefFragment(refURI, schemaRootTableId, type);
  }

  private findDefFragment(
    refURI: URI,
    schemaRootTableId: string,
    type: string
  ) {
    const fragmentDefsName = this.getFragmentDefsName(refURI);
    if (fragmentDefsName) {
      const compatibleSchemaDefinition = _.find(
        this.defs,
        (def) => def.tableId === schemaRootTableId
      );
      if (compatibleSchemaDefinition) {
        const fragmentInCompatibleSchemaDefinition = _.find(
          this.defs,
          (def) =>
            def.schemaRootTableId === compatibleSchemaDefinition.tableId &&
            fragmentDefsName === def.name
        );
        if (fragmentInCompatibleSchemaDefinition) {
          return new Ref(
            fragmentInCompatibleSchemaDefinition.tableId,
            type,
            false,
            false,
            this.isAbsoluteURI(refURI)
          );
        }
      }
    }
    return new Ref(
      undefined,
      "$ref",
      !this.isOnlyFragmentRI(refURI),
      false,
      false
    );
  }

  private findDefAbsoluteNotFragment(
    refURI: URI,
    schemaRootTableId: string,
    type: string
  ) {
    if (
      (this.isAbsoluteURI(refURI) && this.isSameSchema(refURI)) ||
      this.isRelativeURI(refURI)
    ) {
      const path = this.buildRefURIPath(refURI);
      const compatibleSchemaDefinition = _.find(
        this.defs,
        (def) => !!def.id && !!path && this.compareURI(def.id, path)
      );
      if (compatibleSchemaDefinition) {
        return this.findFragmentInCompatibleSchema(
          refURI,
          compatibleSchemaDefinition,
          type,
          schemaRootTableId
        );
      }
    }
    return new Ref(undefined, type, true, false, false);
  }

  private findFragmentInCompatibleSchema(
    refURI: URI,
    compatibleSchemaDefinition: Definition,
    type: string,
    schemaRootTableId: string
  ) {
    const fragmentDefsName = this.getFragmentDefsName(refURI);
    if (fragmentDefsName) {
      const fragmentInCompatibleSchemaDefinition = _.find(
        this.defs,
        (def) =>
          def.schemaRootTableId === compatibleSchemaDefinition.tableId &&
          fragmentDefsName === def.name
      );
      if (fragmentInCompatibleSchemaDefinition) {
        return new Ref(
          fragmentInCompatibleSchemaDefinition.tableId,
          type,
          false,
          fragmentInCompatibleSchemaDefinition.schemaRootTableId !==
            schemaRootTableId,
          this.isAbsoluteURI(refURI)
        );
      }
    } else {
      return new Ref(
        compatibleSchemaDefinition.tableId,
        type,
        false,
        false,
        this.isAbsoluteURI(refURI)
      );
    }
    return new Ref(undefined, "$ref", false, false, false);
  }

  nullToUndefined(value: any) {
    return value === null ? undefined : value;
  }

  compareURI(uri1text: string, uri2text: string): boolean {
    const uri1 = URI.parse(uri1text);
    const uri2 = URI.parse(uri2text);
    return (
      this.nullToUndefined(uri1.protocol) ===
        this.nullToUndefined(uri2.protocol) &&
      this.nullToUndefined(uri1.hostname) ===
        this.nullToUndefined(uri2.hostname) &&
      this.nullToUndefined(uri1.port) === this.nullToUndefined(uri2.port) &&
      this.nullToUndefined(uri1.path) === this.nullToUndefined(uri2.path) &&
      this.nullToUndefined(uri1.fragment) ===
        this.nullToUndefined(uri2.fragment)
    );
  }

  private isOnlyFragmentRI(refURI: URI) {
    return (
      !refURI.protocol() &&
      !refURI.hostname() &&
      !refURI.path() &&
      !!refURI.fragment()
    );
  }

  private buildRefURIPath(refURI: URI) {
    const modifiedRefURIpath = this.getRefURIPathNotSlashStart(
      refURI,
      refURI.path() === "" ? this.baseURI.path() : refURI.path()
    );

    const port = refURI.port() ? `:${this.baseURI.port()}` : ``;
    return `${this.baseURI.protocol()}://${this.baseURI.hostname()}${port}${modifiedRefURIpath}`;
  }

  private getRefURIPathNotSlashStart(refURI: URI, originalRefURIpath: string) {
    // "meta/validation#/$defs/stringArray"
    if (!refURI.path().startsWith("/") && refURI.path().length > 0) {
      const baseURIpath = this.baseURI.path().split("/");
      const refURIpath = refURI.path().split("/");
      const removeLastBaseURI = [...baseURIpath];
      removeLastBaseURI.pop();
      return [...removeLastBaseURI, ...refURIpath].join("/");
    }
    return originalRefURIpath;
  }

  private getFragmentDefsName(refURI: URI) {
    // "http://json-schema.org/draft-07/schema#/definitions/nonNegativeInteger"
    // ->  nonNegativeInteger
    if (refURI && refURI.fragment().length > 0) {
      return _.last(refURI.fragment().split("/"));
    }
    return "";
  }

  private isSameSchema(refURI: URI) {
    return (
      this.baseURI.protocol() == refURI.protocol() &&
      this.baseURI.hostname() === refURI.hostname() &&
      this.baseURI.port() === refURI.port()
    );
  }

  private isAbsoluteURI(uri: URI) {
    return !!uri && !!uri.protocol() && !!uri.hostname();
  }

  private isRelativeURI(uri: URI) {
    return !!uri && !uri.protocol() && !uri.hostname() && !!uri.path();
  }

  private existsPath(targetTableId: string, sourceTableId: string) {
    if (sourceTableId === targetTableId) {
      return true;
    }
    if (this.refs[targetTableId]) {
      for (const step of this.refs[targetTableId]) {
        if (this.existsPath(step, sourceTableId)) {
          return true;
        }
      }
    }
    return false;
  }

  public addRef(targetTableId: string, sourceTableId: string) {
    if (this.existsPath(targetTableId, sourceTableId)) {
      return false;
    }
    if (!this.refs[sourceTableId]?.includes(targetTableId)) {
      this.refs[sourceTableId] = [
        ...(this.refs[sourceTableId] ?? []),
        targetTableId
      ];
    }
    return true;
  }
}
