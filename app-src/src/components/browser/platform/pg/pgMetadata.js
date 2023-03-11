import { ModelObjectProperties, ObjectType } from "../../../../enums/enums";
import {
  columnGroup,
  domainGroup,
  enumGroup,
  functionGroup,
  lineGroup,
  lineIdGroup,
  materializedViewGroup,
  modelGroup,
  noteGroup,
  otherObjectGroup,
  policyGroup,
  procedureGroup,
  relationGroup,
  rulesGroup,
  sequenceGroup,
  tableGroup,
  triggerGroup,
  typeGroup,
  viewGroup
} from "../metadata";

import _ from "lodash";

const compositeGroups = {
  columns: columnGroup(),
  lines: lineIdGroup()
};

const compositeGroup = {
  composites: {
    getObjects: (model, objOwner) =>
      _.filter(
        model.tables,
        (item) => item.objectType === "composite" && item.embeddable === false
      ),
    groups: compositeGroups,
    selectableItems: true,
    focusableItems: true,
    hasVisibilityControl: true,
    label: "L_COMPOSITES",
    ...ModelObjectProperties.TABLE,
    propertyName: "composites"
  }
};

export const pgMetadata = (profile) => {
  return {
    propertyName: ObjectType.MODEL,
    groups: {
      ...modelGroup,
      ...tableGroup,
      ...compositeGroup,
      ...relationGroup,
      ...lineGroup,
      ...viewGroup,
      ...materializedViewGroup,
      ...domainGroup,
      ...typeGroup,
      ...enumGroup,
      ...functionGroup,
      ...procedureGroup,
      ...rulesGroup,
      ...policyGroup,
      ...sequenceGroup,
      ...triggerGroup,
      ...otherObjectGroup,
      ...noteGroup
    }
  };
};
