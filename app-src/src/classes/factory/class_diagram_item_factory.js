import { ClassDiagramItem } from "../class_diagram_item";
import { OtherObjectTypes } from "common";

export const createDiagramItem = (obj, type, left, top) => {
  const di = new ClassDiagramItem(obj.id, left, top, 60, 160);
  if (type === "table") {
    di.gWidth = 200;
    di.background = getTableBackground(obj);
  } else if (type === "note") {
    di.gHeight = 60;
    di.gWidth = 160;
    di.color = "#333";
    di.background = "#f9e79f";
  } else if (type === "other_object") {
    di.gHeight = 40;
    di.gWidth = 120;
    di.color = "#eee";
    di.background = getOtherObjectBackground(obj);
  }
  return di;
};

const getTableBackground = (table) => {
  switch (table.objectType) {
    case "interface":
      return "#8bc34a";
    case "union":
      return "#3f51b5";
    case "input":
      return "#ff9800";
    case "composite":
      return "#ff9800";
    default:
      return table.embeddable ? "#8bc34a" : "#03a9f4";
  }
};

const getOtherObjectBackground = (otherObject) => {
  switch (otherObject.type) {
    case OtherObjectTypes.Other:
      return "#009688";
    case OtherObjectTypes.Scalar:
      return "#000";
    case OtherObjectTypes.Policy:
    case OtherObjectTypes.Enum:
    case OtherObjectTypes.Trigger:
      return "#9c27b0";
    case OtherObjectTypes.TypeOther:
    case OtherObjectTypes.UserDefinedType:
    case OtherObjectTypes.Domain:
    case OtherObjectTypes.Sequence:
    case OtherObjectTypes.Rule:
    case OtherObjectTypes.Query:
    case OtherObjectTypes.Procedure:
      return "#795548";
    case OtherObjectTypes.Function:
    case OtherObjectTypes.Mutation:
      return "#607d8b";
    case OtherObjectTypes.MaterializedView:
    case OtherObjectTypes.View:
      return "#3f51b5";
    default:
      return "#795548";
  }
};
