import React, { Component } from "react";

export default class ToolbarButton extends Component {
  doNothing() {
    return;
  }

  render() {
    return (
      <div
        className={"toolbar-item " + this.props.customCss}
        onClick={this.props.isEnabled ? this.props.onClick : this.doNothing()}
        data-testid={this.props["data-testid"]}
      >
        <i className={this.props.icon + " im-icon-toolbar"} />

        {this.props.showCaption ? (
          <div className="im-toolbar-caption">{this.props.caption}</div>
        ) : (
          <div className="im-toolbar-caption-hidden">{this.props.caption}</div>
        )}

        {this.props.isSelected ? (
          <i className="im-icon-FullCircle im-toolbar-item-selected" />
        ) : (
          ""
        )}
        {this.props.tooltip ? (
          <div className={"im-tooltip " + this.props.tooltipClass}>
            {this.props.tooltip}
          </div>
        ) : (
          ""
        )}
      </div>
    );
  }
}
