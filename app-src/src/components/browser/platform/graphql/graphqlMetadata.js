import { ModelObjectProperties, ObjectType } from "../../../../enums/enums";
import {
  columnGroup,
  enumGroup,
  lineGroup,
  modelGroup,
  noteGroup,
  relationGroup
} from "../metadata";

import { OtherObjectTypes } from "common";
import _ from "lodash";

export const graphQlTableGroups = {
  columns: columnGroup()
};

export const typeGroup = {
  types: {
    getObjects: (model, objOwner) =>
      _.filter(model.tables, (table) => table.objectType === "type"),
    ...ModelObjectProperties.TABLE,
    propertyName: "types",
    groups: graphQlTableGroups,
    selectableItems: true,
    focusableItems: true,
    hasVisibilityControl: true,
    label: "L_TABLES"
  }
};

export const inputGroup = {
  inputs: {
    getObjects: (model, objOwner) =>
      _.filter(model.tables, (table) => table.objectType === "input"),
    ...ModelObjectProperties.TABLE,
    propertyName: "inputs",
    groups: graphQlTableGroups,
    selectableItems: true,
    focusableItems: true,
    hasVisibilityControl: true,
    label: "L_INPUTS"
  }
};

export const interfaceGroup = {
  interfaces: {
    getObjects: (model, objOwner) =>
      _.filter(model.tables, (table) => table.objectType === "interface"),
    ...ModelObjectProperties.TABLE,
    propertyName: "interfaces",
    groups: graphQlTableGroups,
    selectableItems: true,
    focusableItems: true,
    hasVisibilityControl: true,
    label: "L_INTERFACES"
  }
};

export const unionGroup = {
  unions: {
    getObjects: (model, objOwner) =>
      _.filter(model.tables, (table) => table.objectType === "union"),
    ...ModelObjectProperties.TABLE,
    propertyName: "unions",
    groups: graphQlTableGroups,
    selectableItems: true,
    focusableItems: true,
    hasVisibilityControl: true,
    label: "L_UNIONS"
  }
};

export const implementGroup = {
  implements: {
    getObjects: (model, objOwner) => _.values(model.implements),
    ...ModelObjectProperties.RELATION,
    propertyName: "imlements",
    focusableItems: true,
    label: "L_IMPLEMENTS"
  }
};

export const scalarGroup = {
  scalars: {
    getObjects: (model, objOwner) =>
      _.filter(
        model.otherObjects,
        (otherObject) => otherObject.type === OtherObjectTypes.Scalar
      ),
    ...ModelObjectProperties.OTHER_OBJECT,
    propertyName: "scalars",
    groups: graphQlTableGroups,
    selectableItems: true,
    focusableItems: true,
    hasVisibilityControl: true,
    label: "L_SCALAR"
  }
};

export const mutationGroup = {
  mutations: {
    getObjects: (model, objOwner) =>
      _.filter(
        model.otherObjects,
        (otherObject) => otherObject.type === OtherObjectTypes.Mutation
      ),
    ...ModelObjectProperties.OTHER_OBJECT,
    propertyName: "mutations",
    groups: graphQlTableGroups,
    selectableItems: true,
    focusableItems: true,
    hasVisibilityControl: true,
    label: "L_MUTATIONS"
  }
};

export const queryGroup = {
  queries: {
    getObjects: (model, objOwner) =>
      _.filter(
        model.otherObjects,
        (otherObject) => otherObject.type === OtherObjectTypes.Query
      ),
    ...ModelObjectProperties.OTHER_OBJECT,
    propertyName: "queries",
    groups: graphQlTableGroups,
    selectableItems: true,
    focusableItems: true,
    hasVisibilityControl: true,
    label: "L_QUERIES"
  }
};

export const graphQLMetadata = () => {
  return {
    propertyName: ObjectType.MODEL,
    groups: {
      ...modelGroup,
      ...typeGroup,
      ...inputGroup,
      ...interfaceGroup,
      ...unionGroup,
      ...relationGroup,
      ...implementGroup,
      ...enumGroup,
      ...scalarGroup,
      ...mutationGroup,
      ...queryGroup,
      ...lineGroup,
      ...noteGroup
    }
  };
};
