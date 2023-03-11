import {
  functionGroup,
  jsonGroup,
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

export const mysqlFamilyMetadata = () => {
  return {
    propertyName: ObjectType.MODEL,
    groups: {
      ...modelGroup,
      ...tableGroup,
      ...jsonGroup,
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
