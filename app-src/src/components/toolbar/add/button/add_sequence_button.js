import { OtherObjectTypes, TEST_ID } from "common";
import React, { Component } from "react";

import { DiagramAreaMode } from "../../../../enums/enums";
import ToolbarButton from "../../../toolbar_button";
import _ from "lodash";
import { addOtherObject } from "../../../../actions/diagram_add";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";

class AddSequenceButton extends Component {
  constructor(toolbarOptions) {
    super();
    this.toolbarOptions = toolbarOptions;
  }

  render() {
    const isModeAddSequence =
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_SEQUENCE;
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption={"Add " + OtherObjectTypes.Sequence}
        onClick={this.props.addOtherObject.bind(
          this,
          OtherObjectTypes.Sequence
        )}
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={isModeAddSequence}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.OTHER.SEQUENCE}
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
  connect(mapStateToProps, mapDispatchToProps)(AddSequenceButton)
);
