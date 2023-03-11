import React, { Component } from "react";

import { DiagramAreaMode } from "../../../../enums/enums";
import { TEST_ID } from "common";
import ToolbarButton from "../../../toolbar_button";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { setDiagramAreaMode } from "../../../../actions/ui";
import { withRouter } from "react-router";

class AddOtherButton extends Component {
  constructor(toolbarOptions) {
    super();
    this.toolbarOptions = toolbarOptions;
  }

  render() {
    return (
      <ToolbarButton
        onClick={this.props.setDiagramAreaMode.bind(
          this,
          DiagramAreaMode.ARROW
        )}
        showCaption={this.props.showToolbarCaptions}
        caption="Other"
        icon="im-icon-Script"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={this.props.toolbarOptions.missingModel}
        tooltip={"Click diagram area to create a new item"}
        tooltipClass="im-tooltip-right"
        isSelected={
          this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_OTHER ||
          this.props.currentDiagramAreaMode ===
            DiagramAreaMode.ADD_TYPE_OTHER ||
          this.props.currentDiagramAreaMode ===
            DiagramAreaMode.ADD_USER_DEFINED_TYPE ||
          this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_VIEW ||
          this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_FUNCTION ||
          this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_PROCEDURE ||
          this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_TRIGGER ||
          this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_SEQUENCE
        }
        data-testid={TEST_ID.TOOLBAR.OTHER.DROPDOWN}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    showToolbarCaptions: state.settings.showToolbarCaptions,
    currentDiagramAreaMode: state.ui.currentDiagramAreaMode,
    localization: state.localization
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
  connect(mapStateToProps, mapDispatchToProps)(AddOtherButton)
);
