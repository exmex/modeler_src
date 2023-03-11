import { BSONDatatypeResolver } from "./BSONDatatypeResolver";
import { BSONDocument } from "./BSONDocument";
import { BSONField } from "./BSONField";
import { BSONRelationRegistry } from "../../model/providers/bson/relation/BSONRelationRegistry";

export class BSONDocumentParser {
  private obj: any;
  private doc: BSONDocument;
  private relationRegistry: BSONRelationRegistry;

  public constructor(
    obj: any,
    doc: BSONDocument,
    relationRegistry: BSONRelationRegistry
  ) {
    this.obj = obj;
    this.doc = doc;
    this.relationRegistry = relationRegistry;
  }

  public async parseDocument(shouldRegisterReference: boolean): Promise<void> {
    if (!this.obj) {
      return;
    }

    const parseResults: Promise<any>[] = [];
    Object.keys(this.obj).forEach((key: string): void => {
      parseResults.push(this.parseKey(key, shouldRegisterReference));
    });
    await Promise.all(parseResults);
  }

  private async parseKey(
    key: string,
    shouldRegisterReference: boolean
  ): Promise<void> {
    const field = this.doc.findOrCreateField(key);
    const value = this.obj[key];
    const datatype = BSONDatatypeResolver.getDataType(value);

    if (datatype === "array") {
      await this.parseArrayValues(field, key, value, shouldRegisterReference);
    } else {
      await this.parseValue(
        datatype,
        field,
        key,
        value,
        false,
        shouldRegisterReference
      );
    }
  }

  private async parseValue(
    datatype: string,
    field: BSONField,
    key: string,
    value: any,
    array: boolean,
    shouldRegisterReference: boolean
  ): Promise<void> {
    if (array) {
      field.arrayDatatypes.add(datatype);
    } else {
      field.datatypes.add(datatype);
    }
    await this.parseNestedDocument(datatype, field, key, value, false);
    await this.registerReferences(
      datatype,
      field,
      value,
      shouldRegisterReference
    );
  }

  private async parseArrayValues(
    field: BSONField,
    key: string,
    arrayOfValues: [],
    shouldRegisterReference: boolean
  ): Promise<void> {
    const result: Promise<void>[] = [];
    arrayOfValues.forEach((value: []): void => {
      const datatype = BSONDatatypeResolver.getDataType(value);
      result.push(
        this.processArrayValues(
          datatype,
          field,
          key,
          value,
          shouldRegisterReference
        )
      );
    });
    await Promise.all(result);
  }

  private async processArrayValues(
    datatype: string,
    field: BSONField,
    key: string,
    value: [],
    shouldRegisterReference: boolean
  ): Promise<void> {
    if (datatype !== "array") {
      await this.parseValue(
        datatype,
        field,
        key,
        value,
        true,
        shouldRegisterReference
      );
    } else {
      field.datatypes.add("array");
    }
  }

  private async registerReferences(
    datatype: string,
    field: BSONField,
    value: any,
    shouldRegisterReference: boolean
  ): Promise<void> {
    if (datatype === "objectId" && !field.isPk() && shouldRegisterReference) {
      await this.relationRegistry.register(value, this.doc, field);
    }
  }

  private async parseNestedDocument(
    datatype: string,
    field: BSONField,
    key: string,
    item: any,
    shouldRegisterReference: boolean
  ): Promise<void> {
    if (datatype === "object") {
      if (!field.subDocument) {
        field.subDocument = new BSONDocument(`${this.doc.name}.${key}`, false);
      }
      const parser = new BSONDocumentParser(
        item,
        field.subDocument,
        this.relationRegistry
      );
      await parser.parseDocument(shouldRegisterReference);
    }
  }
}
