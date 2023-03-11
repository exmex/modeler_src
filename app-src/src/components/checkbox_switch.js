import React, { Component } from "react";

export default class CheckboxSwitch extends Component {
  render() {
    const style = this.props.className ?? " ";
    return (
      <div className={style} hidden={this.props.hidden}>
        <label className={"im-switch " + style}>
          <input type="checkbox" {...this.props} />
          <span className={"im-slider im-round " + style} />
        </label>
        <div className="im-ch-label">{this.props.label}</div>
      </div>
    );
  }
}
