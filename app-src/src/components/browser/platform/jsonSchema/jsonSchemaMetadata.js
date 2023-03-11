import { ModelObjectProperties, ObjectType } from "../../../../enums/enums";

import JsonSchemaHelpers from "../../../../platforms/jsonschema/helpers_jsonschema";
import _ from "lodash";
import { modelGroup } from "../metadata";

export const jsonSchemaGroup = {
  tables: {
    getObjects: (model) =>
      _.filter(
        model.tables,
        (item) =>
          JsonSchemaHelpers.isRootOrDef(item) &&
          item.embeddable === false &&
          item.objectType !== "ref"
      ),
    ...ModelObjectProperties.TABLE,
    groups: {},
    selectableItems: false,
    focusableItems: true,
    hasVisibilityControl: false,
    label: "L_ROOT"
  }
};

export const subschemasGroup = {
  subschemas: {
    getObjects: (model) =>
      _.filter(
        model.tables,
        (item) =>
          JsonSchemaHelpers.isRootOrDef(item) &&
          item.embeddable === true &&
          item.objectType !== "ref"
      ),
    ...ModelObjectProperties.TABLE,
    propertyName: "subschemas",
    groups: {},
    selectableItems: true,
    focusableItems: true,
    hasVisibilityControl: true,
    label: "L_SUBSCHEMAS"
  }
};

export const externalRefSchemaGroup = {
  externalRefs: {
    getObjects: (model) =>
      _.filter(
        model.tables,
        (item) =>
          JsonSchemaHelpers.isRootOrDef(item) &&
          item.embeddable === true &&
          item.objectType === "ref"
      ),
    ...ModelObjectProperties.TABLE,
    propertyName: "externalRefs",
    groups: {},
    selectableItems: true,
    focusableItems: true,
    hasVisibilityControl: true,
    label: "L_EXTERNALREFS"
  }
};
export const jsonSchemaMetadata = () => {
  return {
    propertyName: ObjectType.MODEL,
    groups: {
      ...modelGroup,
      ...jsonSchemaGroup,
      ...subschemasGroup,
      ...externalRefSchemaGroup
    }
  };
};

export const openAPIMetadata = () => {
  return {
    propertyName: ObjectType.MODEL,
    groups: {
      ...modelGroup,
      ...jsonSchemaGroup
    }
  };
};
