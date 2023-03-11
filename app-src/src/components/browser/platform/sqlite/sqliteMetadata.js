import {
  lineGroup,
  modelGroup,
  noteGroup,
  otherObjectGroup,
  relationGroup,
  tableGroup,
  triggerGroup,
  viewGroup
} from "../metadata";

import { ObjectType } from "../../../../enums/enums";

export const sqliteMetadata = (profile) => {
  return {
    propertyName: ObjectType.MODEL,
    groups: {
      ...modelGroup,
      ...tableGroup,
      ...relationGroup,
      ...lineGroup,
      ...viewGroup,
      ...triggerGroup,
      ...otherObjectGroup,
      ...noteGroup
    }
  };
};
