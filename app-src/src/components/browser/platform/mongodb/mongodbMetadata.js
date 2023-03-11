import {
  functionGroup,
  lineGroup,
  modelGroup,
  noteGroup,
  otherObjectGroup,
  relationGroup,
  tableGroup,
  viewGroup
} from "../metadata";

import { ObjectType } from "../../../../enums/enums";

export const mongoDbMetadata = () => {
  return {
    propertyName: ObjectType.MODEL,
    groups: {
      ...modelGroup,
      ...tableGroup,
      ...relationGroup,
      ...lineGroup,
      ...viewGroup,
      ...functionGroup,
      ...otherObjectGroup,
      ...noteGroup
    }
  };
};
