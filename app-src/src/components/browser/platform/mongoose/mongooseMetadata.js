import { ModelObjectProperties, ObjectType } from "../../../../enums/enums";
import {
  columnGroup,
  enumGroup,
  keyGroup,
  lineGroup,
  lineIdGroup,
  modelGroup,
  noteGroup,
  otherObjectGroup,
  relationGroup,
  relationIdGroup
} from "../metadata";

import _ from "lodash";

export const mongooseTableGroups = {
  columns: columnGroup(),
  keys: keyGroup(),
  relations: relationIdGroup(),
  lines: lineIdGroup()
};

export const mongooseTableGroup = {
  tables: {
    getObjects: (model, objOwner) =>
      _.filter(
        model.tables,
        (item) =>
          (item.objectType === "table" || !item.objectType) &&
          item.embeddable === false
      ),
    ...ModelObjectProperties.TABLE,
    groups: mongooseTableGroups,
    selectableItems: true,
    focusableItems: true,
    hasVisibilityControl: true,
    label: "L_TABLES"
  }
};

export const mongooseMetadata = () => {
  return {
    propertyName: ObjectType.MODEL,
    groups: {
      ...modelGroup,
      ...mongooseTableGroup,
      ...relationGroup,
      ...lineGroup,
      ...enumGroup,
      ...otherObjectGroup,
      ...noteGroup
    }
  };
};
