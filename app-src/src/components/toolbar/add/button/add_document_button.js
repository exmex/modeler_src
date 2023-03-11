import React, { Component } from "react";

import { DiagramAreaMode } from "../../../../enums/enums";
import { TEST_ID } from "common";
import ToolbarButton from "../../../toolbar_button";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { onAddEmbeddableClick } from "../../../../actions/tables";
import { withRouter } from "react-router";

class AddDocumentButton extends Component {
  constructor(toolbarOptions) {
    super();
    this.toolbarOptions = toolbarOptions;
  }

  render() {
    const isModeAddDocument =
      this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_DOCUMENT;
    return (
      <ToolbarButton
        isSelected={isModeAddDocument}
        showCaption={this.props.showToolbarCaptions}
        caption={_.upperFirst(this.props.localization.L_TABLE_EMBEDDABLE)}
        onClick={this.props.onAddEmbeddableClick.bind(this)}
        icon="im-icon-Type"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={this.props.toolbarOptions.missingModel}
        tooltip={
          "Click diagram area to create a new " +
          this.props.localization.L_TABLE_EMBEDDABLE
        }
        tooltipClass="im-tooltip-left"
        data-testid={TEST_ID.TOOLBAR.NESTED_TYPE}
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
        onAddEmbeddableClick
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(AddDocumentButton)
);
