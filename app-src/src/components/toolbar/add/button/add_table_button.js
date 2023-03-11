import React, { Component } from "react";

import { DiagramAreaMode } from "../../../../enums/enums";
import { TEST_ID } from "common";
import ToolbarButton from "../../../toolbar_button";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { onAddClick } from "../../../../actions/tables";
import { withRouter } from "react-router";

class AddTableButton extends Component {
  constructor(toolbarOptions) {
    super();
    this.toolbarOptions = toolbarOptions;
  }

  render() {
    const isModeAddTable =
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_TABLE;
    return (
      <ToolbarButton
        isSelected={isModeAddTable}
        showCaption={this.props.showToolbarCaptions}
        caption={_.upperFirst(this.props.localization.L_TABLE)}
        onClick={this.props.onAddClick.bind(this)}
        icon="im-icon-Table"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={this.props.toolbarOptions.missingModel}
        tooltipClass="im-tooltip-left"
        data-testid={TEST_ID.TOOLBAR.TABLE}
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
        onAddClick
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(AddTableButton)
);
