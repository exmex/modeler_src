import {
  lineGroup,
  modelGroup,
  noteGroup,
  otherObjectGroup,
  relationGroup,
  tableGroup
} from "../metadata";

import { ObjectType } from "../../../../enums/enums";

export const sequelizeMetadata = () => {
  return {
    propertyName: ObjectType.MODEL,
    groups: {
      ...modelGroup,
      ...tableGroup,
      ...relationGroup,
      ...lineGroup,
      ...otherObjectGroup,
      ...noteGroup
    }
  };
};
