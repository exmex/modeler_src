import { showAccount, showConfig } from "../../../actions/modals";

import { Component } from "react";
import React from "react";
import { TEST_ID } from "common";
import ToolbarButton from "../../toolbar_button";
import { connect } from "react-redux";
import { withRouter } from "react-router";

const ipcRenderer = window?.ipcRenderer;
class SettingsToolbarContainer extends Component {
  renderAccountButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Account"
        onClick={showAccount.bind(this, this.props.history)}
        icon="im-icon-User"
        isEnabled={true}
        tooltip="Set user information"
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.ACCOUNT}
      />
    );
  }

  renderSettingsButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Settings"
        onClick={showConfig.bind(this, this.props.history)}
        icon="im-icon-Configuration"
        isEnabled={true}
        tooltip="Change application settings"
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.SETTINGS}
      />
    );
  }

  render() {
    return (
      <>
        <div className="toolbar-container toolbar-container-settings">
          <div className="toolbar-wrapper">{this.renderSettingsButton()}</div>

          {ipcRenderer && (
            <>
              <div className="toolbar-item-divider" />
              <div className="toolbar-wrapper">
                {this.renderAccountButton()}
              </div>
            </>
          )}
        </div>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    showToolbarCaptions: state.settings.showToolbarCaptions
  };
}

export default withRouter(connect(mapStateToProps)(SettingsToolbarContainer));
