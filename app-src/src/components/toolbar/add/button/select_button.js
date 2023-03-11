import React, { Component } from "react";

import { DiagramAreaMode } from "../../../../enums/enums";
import { TEST_ID } from "common";
import ToolbarButton from "../../../toolbar_button";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { setDiagramAreaMode } from "../../../../actions/ui";

class SelectButton extends Component {
  constructor(toolbarOptions) {
    super();
    this.toolbarOptions = toolbarOptions;
  }

  render() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Select"
        onClick={this.props.setDiagramAreaMode.bind(
          this,
          DiagramAreaMode.ARROW
        )}
        icon="im-icon-Arrow"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={this.props.toolbarOptions.missingModel}
        tooltipClass="im-tooltip-left"
        data-testid={TEST_ID.TOOLBAR.SELECTION}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    showToolbarCaptions: state.settings.showToolbarCaptions
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        setDiagramAreaMode
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(SelectButton)
);
