import {
  jsonGroup,
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

export const sqliteMetadata = () => {
  return {
    propertyName: ObjectType.MODEL,
    groups: {
      ...modelGroup,
      ...tableGroup,
      ...jsonGroup,
      ...relationGroup,
      ...lineGroup,
      ...viewGroup,
      ...triggerGroup,
      ...otherObjectGroup,
      ...noteGroup
    }
  };
};
