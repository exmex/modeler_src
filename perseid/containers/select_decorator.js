import React, { Component } from "react";

class SelectDecorator extends Component {
  render() {
    const posX = Math.min(
      this.props.dimensions.startX,
      this.props.dimensions.endX
    );
    const posY = Math.min(
      this.props.dimensions.startY,
      this.props.dimensions.endY
    );
    return (
      <div
        style={{
          left: posX + "px",
          top: posY + "px",
          width: "0px",
          height: "0px",
          display: "none"
        }}
        className="im-select-decorator"
        id={this.props.id}
      />
    );
  }
}

export default SelectDecorator;
