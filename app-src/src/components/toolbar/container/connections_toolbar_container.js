import {
  Features,
  isFeatureAvailable
} from "../../../helpers/features/features";

import { Component } from "react";
import React from "react";
import { TEST_ID } from "common";
import ToolbarButton from "../../toolbar_button";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { showConnections } from "../../../actions/modals";
import { withRouter } from "react-router";

class ConnectionsToolbarContainer extends Component {
  renderConnectionsButton() {
    return (
      <ToolbarButton
        id="toolbar-btn-connections"
        showCaption={this.props.showToolbarCaptions}
        caption="Connections"
        tooltip="Show existing connections"
        onClick={this.props.showConnections.bind(this, this.props.history)}
        icon="im-icon-ShowData16"
        isEnabled={true}
        tooltipClass="im-tooltip-left"
        data-testid={TEST_ID.TOOLBAR.CONNECTIONS}
      />
    );
  }

  render() {
    const isConnectionsAvailable = isFeatureAvailable(
      this.props.profile.availableFeatures,
      Features.CONNECTIONS
    );
    const isDisabledConnectionsAvailable = isFeatureAvailable(
      this.props.profile.availableFeatures,
      Features.DISABLED_CONNECTIONS
    );
    return (
      (isConnectionsAvailable || isDisabledConnectionsAvailable) && (
        <div className="toolbar-container toolbar-container-connections">
          <>
            <div className="toolbar-wrapper">
              {this.renderConnectionsButton()}
            </div>
            <div className="toolbar-item-divider" />
          </>
        </div>
      )
    );
  }
}

function mapStateToProps(state) {
  return {
    showToolbarCaptions: state.settings.showToolbarCaptions,
    profile: state.profile
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        showConnections
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ConnectionsToolbarContainer)
);
