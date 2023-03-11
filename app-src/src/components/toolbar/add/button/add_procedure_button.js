import { OtherObjectTypes, TEST_ID } from "common";
import React, { Component } from "react";

import { DiagramAreaMode } from "../../../../enums/enums";
import ToolbarButton from "../../../toolbar_button";
import _ from "lodash";
import { addOtherObject } from "../../../../actions/diagram_add";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";

class AddProcedureButton extends Component {
  constructor(toolbarOptions) {
    super();
    this.toolbarOptions = toolbarOptions;
  }

  render() {
    const isModeAddProcedure =
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_PROCEDURE;
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption={"Add " + OtherObjectTypes.Procedure}
        onClick={this.props.addOtherObject.bind(
          this,
          OtherObjectTypes.Procedure
        )}
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={isModeAddProcedure}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.OTHER.PROCEDURE}
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
        addOtherObject
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(AddProcedureButton)
);
