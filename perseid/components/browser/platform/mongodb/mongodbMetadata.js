import {
  functionGroup,
  jsonGroup,
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
      ...jsonGroup,
      ...relationGroup,
      ...lineGroup,
      ...viewGroup,
      ...functionGroup,
      ...otherObjectGroup,
      ...noteGroup
    }
  };
};
