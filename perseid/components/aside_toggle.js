import React, { Component } from "react";

import AsideToggleButton from "../containers/aside_toggle_button";

export default class AsideToggle extends Component {
  render() {
    return (
      <div tabIndex={4} className="aside-toggle" onClick={this.props.onClick}>
        <AsideToggleButton
          icon={this.props.icon}
          direction={this.props.direction}
        />
        <div
          className={"aside-toggle-text aside-text-rotate-" + this.props.rotate}
        >
          {this.props.text}
        </div>
      </div>
    );
  }
}
