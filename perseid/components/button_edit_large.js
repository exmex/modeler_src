import React, { Component } from "react";

export default class ButtonEditLarge extends Component {
  render() {
    return (
      <div
        onClick={this.props.onClick}
        className={`im-icon-sm im-pointer im-display-inline-block im-spec-editable-icon ${this.props.customCss}`}
      >
        <i className={`im-icon-${this.props.icon ?? "Edit"} im-icon-16`} />
      </div>
    );
  }
}
