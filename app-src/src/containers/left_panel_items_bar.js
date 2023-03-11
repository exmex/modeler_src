import {
  DROPDOWN_MENU,
  DROPDOWN_MENU_SOURCE,
  openDropDownMenu,
  setSearchTerm
} from "../actions/ui";
import React, { Component } from "react";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

class LeftPanelItemsBar extends Component {
  render() {
    return (
      <div className="im-display-flex">
        <div
          className=" im-pointer im-display-flex im-justify-self-center"
          onClick={(e) => {
            this.props.openDropDownMenu(
              DROPDOWN_MENU.PROJECT,
              DROPDOWN_MENU_SOURCE.LIST,
              { x: e.clientX, y: e.clientY }
            );
          }}
        >
          <i
            style={{ padding: "3px" }}
            className="im-icon-sm im-icon-20 im-icon-DotsHorizontal16"
          />
        </div>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        setSearchTerm,
        openDropDownMenu
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(connect(null, mapDispatchToProps)(LeftPanelItemsBar));
