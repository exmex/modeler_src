import { OtherObjectTypes, TEST_ID } from "common";
import React, { Component } from "react";

import { DiagramAreaMode } from "../../../../enums/enums";
import ToolbarButton from "../../../toolbar_button";
import _ from "lodash";
import { addOtherObject } from "../../../../actions/diagram_add";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";

class AddMaterializedViewButton extends Component {
  constructor(toolbarOptions) {
    super();
    this.toolbarOptions = toolbarOptions;
  }

  render() {
    const isModeAddMaterializedView =
      this.props.currentDiagramAreaMode === DiagramAreaMode.MATERIALIZED_VIEW;
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption={"Add Materialized View"}
        onClick={this.props.addOtherObject.bind(
          this,
          OtherObjectTypes.MaterializedView
        )}
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={isModeAddMaterializedView}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.OTHER.MATERIALIZED_VIEW}
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
  connect(mapStateToProps, mapDispatchToProps)(AddMaterializedViewButton)
);
