import { ClassColumn } from "../../classes/class_column";
import PropTypes from "prop-types";

export class ClassColumnJsonSchema extends ClassColumn {
  constructor(id, name, datatype, isPk, isNn, param, specification) {
    super(id, name, datatype, isPk, isNn);
    this.param = param;
    this.specification = specification ?? "";
  }
}

ClassColumn.PropTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  datatype: PropTypes.string,
  isPk: PropTypes.bool,
  isNn: PropTypes.bool
};

export const KeyTypeNames = {
  DEFINITIONS: {
    nameSingular: "definition",
    namePlural: "definitions",
    nameKey: "definitions"
  },
  DEFS: {
    nameSingular: "def",
    namePlural: "defs",
    nameKey: "$defs"
  },
  PROPERTIES: {
    nameSingular: "property",
    namePlural: "properties",
    nameKey: "properties"
  },
  PATTERN_PROPERTIES: {
    nameSingular: "pattern property",
    namePlural: "pattern properties",
    nameKey: "patternProperties"
  },
  ADDITIONAL_PROPERTIES: {
    nameSingular: "additional property",
    namePlural: "additional properties",
    nameKey: "additionalProperties"
  },
  DEPENDENT_SCHEMAS: {
    nameSingular: "dependent schema",
    namePlural: "dependent schemas",
    nameKey: "dependentSchemas"
  },
  ITEMS: {
    nameSingular: "array item",
    namePlural: "items",
    nameKey: "items"
  },
  PREFIX_ITEMS: {
    nameSingular: "prefix item",
    namePlural: "prefix items",
    nameKey: "prefixItems"
  },
  SUBSCHEMA: {
    nameSingular: "subschema",
    namePlural: "subschemas",
    nameKey: "properties"
  },
  KEYARRAY: {
    nameSingular: "array key",
    namePlural: "array key",
    nameKey: "arrayKey"
  },
  KEYOBJECT: {
    nameSingular: "object key",
    namePlural: "object key",
    nameKey: "objectKey"
  }
};

export const KeyTypes = {
  KEYARRAY: "keyArray",
  KEYOBJECT: "keyObject",
  ALLOF: "allOf",
  ONEOF: "oneOf",
  ANYOF: "anyOf",
  NOT: "not",
  IF: "if",
  THEN: "then",
  ELSE: "else",
  SUBSCHEMA: "subschema"
};
