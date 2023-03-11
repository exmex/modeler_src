import React, { Component } from "react";

export default class ButtonCustom extends Component {
  render() {
    return (
      <button
        className={`im-btn-${this.props.type} im-btn-${this.props.size}`}
        onClick={this.props.onClick}
      >
        {this.props.caption}
      </button>
    );
  }
}
