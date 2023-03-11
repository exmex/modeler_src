import React, { Component } from "react";

import { DiagramAreaMode } from "../../../../enums/enums";
import { TEST_ID } from "common";
import ToolbarButton from "../../../toolbar_button";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { addRelationHas } from "../../../../actions/diagram_add";

class AddRelationButton extends Component {
  constructor(toolbarOptions) {
    super();
    this.toolbarOptions = toolbarOptions;
  }

  render() {
    const isModeAddRelationBelongs =
      this.props.currentDiagramAreaMode ===
      DiagramAreaMode.ADD_RELATION_BELONGS;
    const tooltip =
      "Click parent " +
      this.props.localization.L_TABLE +
      ", then child " +
      this.props.localization.L_TABLE +
      " to create a new " +
      this.props.localization.L_RELATION;
    return (
      <ToolbarButton
        isSelected={isModeAddRelationBelongs}
        showCaption={this.props.showToolbarCaptions}
        caption={_.upperFirst(this.props.localization.L_RELATION_BUTTON2)}
        onClick={this.props.addRelationHas.bind(this)}
        icon="im-icon-RelationDashed"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={this.props.toolbarOptions.missingModel}
        tooltip={tooltip}
        tooltipClass="im-tooltip-left"
        data-testid={TEST_ID.TOOLBAR.RELATION_BELONGS}
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
        addRelationHas
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(AddRelationButton)
);
