import React, { Component } from "react";

import { DiagramAreaMode } from "../../../../enums/enums";
import { TEST_ID } from "common";
import ToolbarButton from "../../../toolbar_button";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { addRelation } from "../../../../actions/diagram_add";

class AddRelationButton extends Component {
  constructor(toolbarOptions) {
    super();
    this.toolbarOptions = toolbarOptions;
  }

  render() {
    const isModeAddRelation =
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_RELATION;
    const tooltip =
      "Click parent " +
      this.props.localization.L_TABLE +
      ", then child " +
      this.props.localization.L_TABLE +
      " to create a new " +
      this.props.localization.L_RELATION;
    return (
      <ToolbarButton
        isSelected={isModeAddRelation}
        showCaption={this.props.showToolbarCaptions}
        caption={_.upperFirst(this.props.localization.L_RELATION_BUTTON)}
        onClick={this.props.addRelation.bind(this)}
        icon="im-icon-Relation"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={this.props.toolbarOptions.missingModel}
        tooltip={tooltip}
        tooltipClass="im-tooltip-left"
        data-testid={TEST_ID.TOOLBAR.RELATION}
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
        addRelation
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(AddRelationButton)
);
