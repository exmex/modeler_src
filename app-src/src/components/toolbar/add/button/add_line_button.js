import React, { Component } from "react";

import { DiagramAreaMode } from "../../../../enums/enums";
import { TEST_ID } from "common";
import ToolbarButton from "../../../toolbar_button";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { addLine } from "../../../../actions/diagram_add";

class AddLineButton extends Component {
  constructor(toolbarOptions) {
    super();
    this.toolbarOptions = toolbarOptions;
  }

  render() {
    const isModeAddLine =
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_LINE;
    return (
      <ToolbarButton
        isSelected={isModeAddLine}
        showCaption={this.props.showToolbarCaptions}
        caption={_.upperFirst(this.props.localization.L_LINE_BUTTON)}
        onClick={this.props.addLine.bind(this)}
        icon="im-icon-Line"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={this.props.toolbarOptions.missingModel}
        tooltip={
          "Click one object and then another " +
          " to create a new " +
          this.props.localization.L_LINE
        }
        tooltipClass="im-tooltip-left"
        data-testid={TEST_ID.TOOLBAR.LINE}
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
        addLine
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(AddLineButton)
);
