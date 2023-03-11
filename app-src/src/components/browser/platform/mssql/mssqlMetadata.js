import {
  columnGroup,
  functionGroup,
  lineGroup,
  lineIdGroup,
  modelGroup,
  noteGroup,
  otherObjectGroup,
  procedureGroup,
  relationGroup,
  sequenceGroup,
  tableGroup,
  triggerGroup,
  userDefinedTypeGroup,
  viewGroup
} from "../metadata";

import { ObjectType } from "../../../../enums/enums";
import _ from "lodash";

export const mssqlMetadata = (profile) => {
  return {
    propertyName: ObjectType.MODEL,
    groups: {
      ...modelGroup,
      ...tableGroup,
      ...relationGroup,
      ...lineGroup,
      ...viewGroup,
      ...functionGroup,
      ...procedureGroup,
      ...sequenceGroup,
      ...triggerGroup,
      ...otherObjectGroup,
      ...userDefinedTypeGroup,
      ...noteGroup
    }
  };
};
