import React, { Component } from "react";

class DiagramSub extends Component {
  render() {
    return (
      <div id={"sub-" + this.props.id} className="diagram-sub im-h-100">
        {this.props.name}
      </div>
    );
  }
}

export default DiagramSub;
