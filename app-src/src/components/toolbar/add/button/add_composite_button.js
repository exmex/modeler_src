import React, { Component } from "react";

import { DiagramAreaMode } from "../../../../enums/enums";
import { TEST_ID } from "common";
import ToolbarButton from "../../../toolbar_button";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { onAddCompositeClick } from "../../../../actions/tables";
import { withRouter } from "react-router";

class AddCompositeButton extends Component {
  constructor(toolbarOptions) {
    super();
    this.toolbarOptions = toolbarOptions;
  }

  render() {
    const isModeAddComposite =
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_COMPOSITE;
    return (
      <ToolbarButton
        isSelected={isModeAddComposite}
        showCaption={this.props.showToolbarCaptions}
        caption={_.upperFirst(this.props.localization.L_COMPOSITE)}
        onClick={this.props.onAddCompositeClick.bind(this)}
        icon="im-icon-Table"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={this.props.toolbarOptions.missingModel}
        tooltip={
          "Click diagram area to create a new " +
          this.props.localization.L_COMPOSITE
        }
        tooltipClass="im-tooltip-left"
        data-testid={TEST_ID.TOOLBAR.COMPOSITE}
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
        onAddCompositeClick
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(AddCompositeButton)
);
