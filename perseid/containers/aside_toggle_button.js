import React, { Component } from "react";
import { toggleAsideLeft, toggleAsideRight } from "../actions/ui";

import { TEST_ID } from "common";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

class AsideToggleButton extends Component {
  async onShowLeftPanel(e) {
    e.stopPropagation();
    await this.props.toggleAsideLeft();
  }

  async onShowRightPanel(e) {
    e.stopPropagation();
    await this.props.toggleAsideRight();
  }

  render() {
    return (
      <div
        data-testid={
          this.props.direction === "left"
            ? TEST_ID.LAYOUT.ASIDE_TOGGLE_BUTTON_LEFT
            : TEST_ID.LAYOUT.ASIDE_TOGGLE_BUTTON_RIGHT
        }
        className="aside-toggle-button"
        onClick={
          this.props.direction === "left"
            ? this.onShowLeftPanel.bind(this)
            : this.onShowRightPanel.bind(this)
        }
      >
        <i
          title="Show or hide panel"
          className={this.props.icon + " im-icon-16 im-icon-sm"}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleAsideLeft: toggleAsideLeft,
        toggleAsideRight: toggleAsideRight
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(AsideToggleButton)
);
