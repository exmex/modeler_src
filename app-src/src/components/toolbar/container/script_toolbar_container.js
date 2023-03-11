import { ModelTypes, TEST_ID } from "common";

import { Component } from "react";
import React from "react";
import ToolbarButton from "../../toolbar_button";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { toggleSqlModal } from "../../../actions/ui";
import { withRouter } from "react-router";

class ScriptToolbarContainer extends Component {
  constructor(toolbarOptions) {
    super();
    this.toolbarOptions = toolbarOptions;
  }

  renderShowScriptButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption={_.upperFirst(this.props.localization.L_SCRIPT)}
        onClick={this.props.toggleSqlModal.bind(this)}
        icon="im-icon-ShowDescription"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={this.props.toolbarOptions.missingModel}
        tooltip={"Generate " + this.props.localization.L_SCRIPT}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.SCRIPT}
      />
    );
  }

  render() {
    const notLogical = this.props.type !== ModelTypes.LOGICAL;
    return (
      notLogical && (
        <div className="toolbar-container toolbar-container-code">
          <div className="toolbar-wrapper">{this.renderShowScriptButton()}</div>
        </div>
      )
    );
  }
}

function mapStateToProps(state) {
  return {
    showToolbarCaptions: state.settings.showToolbarCaptions,
    localization: state.localization,
    type: state.model.type
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleSqlModal
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ScriptToolbarContainer)
);
