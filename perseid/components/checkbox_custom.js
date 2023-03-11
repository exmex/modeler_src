import React, { Component } from "react";

export default class CheckboxCustom extends Component {
  render() {
    const style =
      this.props.className !== undefined ? this.props.className : "";
    return (
      <div className={"im-ma" + style}>
        <label className={"im-container" + style}>
          <input type="checkbox" {...this.props} />
          <span className="checkmark" />
        </label>
        <div className="im-ch-label">{this.props.label}</div>
      </div>
    );
  }
}
