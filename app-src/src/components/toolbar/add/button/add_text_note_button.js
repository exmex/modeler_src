import React, { Component } from "react";
import { addNote, addTextNote } from "../../../../actions/diagram_add";

import { DiagramAreaMode } from "../../../../enums/enums";
import { TEST_ID } from "common";
import ToolbarButton from "../../../toolbar_button";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";

class AddTextNoteButton extends Component {
  constructor(toolbarOptions) {
    super();
    this.toolbarOptions = toolbarOptions;
  }

  render() {
    const isModeAddTextNote =
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_TEXT_NOTE;
    return (
      <ToolbarButton
        isSelected={isModeAddTextNote}
        showCaption={this.props.showToolbarCaptions}
        caption="Text"
        onClick={this.props.addTextNote.bind(this)}
        icon="im-icon-TextNote"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={this.props.toolbarOptions.missingModel}
        tooltip="Click diagram area to add text "
        tooltipClass="im-tooltip-left"
        data-testid={TEST_ID.TOOLBAR.TEXT_NOTE}
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
        addNote,
        addTextNote
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(AddTextNoteButton)
);
