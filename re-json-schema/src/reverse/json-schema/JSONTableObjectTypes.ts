export enum JSONTableObjectTypes {
  ANY = "any",
  //
  SCHEMA = "schema",
  ARRAY = "array",
  OBJECT = "object",
  REF = "ref",
  MULTI = "multi",
  SUBSCHEMA = "subschema",
  //
  KEY = "key",
  KEYARRAY = "keyArray",
  KEYOBJECT = "keyObject",
  INTERNAL = "internalDataType",
  //
  BOOLEAN = "boolean",
  STRING = "string",
  NUMBER = "number",
  INTEGER = "integer",
  NULL = "null",
  TRUE = "true",
  FALSE = "false",
  //
  ALLOF = "allOf",
  ANYOF = "anyOf",
  ONEOF = "oneOf",
  NOT = "not",
  //
  IF = "if",
  THEN = "then",
  ELSE = "else",
  //
  SPECIFICATION = "specification"
}
