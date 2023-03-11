import React, { Component } from "react";

import onClickOutside from "react-onclickoutside";

class ToolbarDropdown extends Component {
  constructor(props) {
    super(props);
    this.state = { isExpanded: false };
  }

  handleClickOutside = (evt) => {
    if (this.state.isExpanded === true) {
      this.setState({ isExpanded: false });
    }
  };

  doNothing() {
    return;
  }

  toggleDropDownDisplayMode() {
    this.setState({ isExpanded: !this.state.isExpanded });
  }

  render() {
    var style = " im-dropdown-hidden";
    if (this.state.isExpanded === true) {
      style = " im-dropdown-block";
    }
    return (
      <div
        onClick={
          this.props.isEnabled === true
            ? this.toggleDropDownDisplayMode.bind(this)
            : this.doNothing()
        }
        className={"toolbar-dropdown " + style}
      >
        {this.props.children}
      </div>
    );
  }
}

var clickOutsideConfig = {
  excludeScrollbar: true
};

export default onClickOutside(ToolbarDropdown, clickOutsideConfig);
