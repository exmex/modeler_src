import React, { Component } from "react";

import { DiagramAreaMode } from "../../../../enums/enums";
import { TEST_ID } from "common";
import ToolbarButton from "../../../toolbar_button";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { addNote } from "../../../../actions/diagram_add";

class AddNoteButton extends Component {
  constructor(toolbarOptions) {
    super();
    this.toolbarOptions = toolbarOptions;
  }

  render() {
    const isModeAddNote =
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_NOTE;
    return (
      <ToolbarButton
        isSelected={isModeAddNote}
        showCaption={this.props.showToolbarCaptions}
        caption="Note"
        onClick={this.props.addNote.bind(this)}
        icon="im-icon-Note"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={this.props.toolbarOptions.missingModel}
        tooltip="Click diagram area to create a new note "
        tooltipClass="im-tooltip-left"
        data-testid={TEST_ID.TOOLBAR.NOTE}
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
        addNote
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(AddNoteButton)
);
