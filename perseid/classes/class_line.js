import PropTypes from "prop-types";

export class ClassLine {
  constructor(
    lineId,
    name,
    parentTableId,
    childTableId,
    parentTableColId,
    childTableColId
  ) {
    this.id = lineId;
    this.visible = true;
    this.name = name;
    this.desc = "";
    this.style = "solid";
    this.parent = parentTableId;
    this.child = childTableId;
    this.parentTableColId = parentTableColId;
    this.childTableColId = childTableColId;
    this.lineColor = "transparent";
    this.markerStart = "none";
    this.markerEnd = "arrowEnd";
    this.linegraphics = "basic";
    this.generate = true;
  }
}

ClassLine.PropTypes = {
  visible: PropTypes.bool,
  name: PropTypes.string
};
