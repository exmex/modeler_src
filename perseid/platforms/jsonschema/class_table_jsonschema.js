import { ClassTable } from "../../classes/class_table";

export class ClassTableJsonSchema extends ClassTable {
  constructor(id, name, cols, keys, embeddable, objectType, nodeType, schema) {
    super(id, name, cols, keys, embeddable);
    this.objectType = objectType;
    this.nodeType = nodeType;
    this.schema = schema || "";
  }
}

export const TableControlTypesJson = {
  STANDARD: "standard",
  ROOT: "root",
  SUBSCHEMA: "subschema",
  EXTERNAL_REF: "external_ref"
};

export const TableObjectTypesJson = {
  ANY: "any",
  //
  SCHEMA: "schema",
  ARRAY: "array",
  OBJECT: "object",
  REF: "ref",
  MULTI: "multi",
  SUBSCHEMA: "subschema",
  //
  KEY: "key",
  KEYARRAY: "keyArray",
  KEYOBJECT: "keyObject",
  INTERNAL: "internalDataType",
  //
  BOOLEAN: "boolean",
  STRING: "string",
  NUMBER: "number",
  INTEGER: "integer",
  NULL: "null",
  TRUE: "true",
  FALSE: "false",
  //
  ALLOF: "allOf",
  ANYOF: "anyOf",
  ONEOF: "oneOf",
  NOT: "not",
  //
  IF: "if",
  THEN: "then",
  ELSE: "else"
};
