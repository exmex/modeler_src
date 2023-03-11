import {
  functionGroup,
  lineGroup,
  materializedViewGroup,
  modelGroup,
  noteGroup,
  otherObjectGroup,
  procedureGroup,
  relationGroup,
  tableGroup,
  triggerGroup,
  viewGroup
} from "../metadata";

import { ObjectType } from "../../../../enums/enums";

export const mysqlFamilyMetadata = (profile) => {
  return {
    propertyName: ObjectType.MODEL,
    groups: {
      ...modelGroup,
      ...tableGroup,
      ...relationGroup,
      ...lineGroup,
      ...viewGroup,
      ...materializedViewGroup,
      ...functionGroup,
      ...procedureGroup,
      ...triggerGroup,
      ...otherObjectGroup,
      ...noteGroup
    }
  };
};
