import { DEV_DEBUG, isDebug } from "../web_env";
import React, { Component, Fragment } from "react";

import BuyNow from "./buy_now";
import ConnectionsList from "./connections_list";
import NavigateBack from "./navigate_back";
import { TEST_ID } from "common";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import isElectron from "is-electron";
import { isFreeware } from "../helpers/features/features";
import { toggleNewConnectionModal } from "../actions/ui";
import { withRouter } from "react-router-dom";

class Connections extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: ""
    };

    this.refSearchBox = React.createRef();
    this.clearSearchTerm = this.clearSearchTerm.bind(this);
    this.onInputChangeDebounced = _.debounce(
      this.onInputChangeDebounced.bind(this),
      200
    );
  }

  newConnection() {
    this.props.toggleNewConnectionModal();
  }

  renderMessage() {
    return (
      <Fragment>
        <div className="im-header-1 im-align-center">Connections</div>
        <div className="im-align-center im-padding-md">
          <h2 data-testid={TEST_ID.CONNECTIONS.COMMERCIAL_FEATURE_TEXT}>
            This feature is available in commercial version
          </h2>
          <p>
            Database connections can be created in trial or commmercial version
            only.
            <br /> Buy a license, then create a new connection and visualize
            existing database structures.
          </p>
          <div className="im-content-spacer-md" />
          <BuyNow />
        </div>

        <div className="im-align-center im-padding-md" />
      </Fragment>
    );
  }

  renderConnections() {
    return (
      <Fragment>
        <div className="im-header-1 im-align-center">Connections</div>
        <div className="im-align-center im-padding-md">
          <button
            className="im-btn-default im-margin-right"
            onClick={this.newConnection.bind(this)}
            data-testid={TEST_ID.CONNECTIONS.CREATE_NEW_CONNECTION_BUTTON}
          >
            Create new connection
          </button>
        </div>
        {this.renderSearchInput()}
        <ConnectionsList searchTerm={this.state.searchTerm} />

        <div className="im-align-center im-padding-md" />
      </Fragment>
    );
  }

  onInputChangeDebounced() {
    this.setState({ searchTerm: this.refSearchBox.current.value });
  }

  clearSearchTerm() {
    this.setState({ searchTerm: "" });
    this.refSearchBox.current.value = "";
  }

  renderSearchInput() {
    var buttonDisplayedStyle = "";

    this.state.searchTerm?.length > 0
      ? (buttonDisplayedStyle = "im-search-button")
      : (buttonDisplayedStyle = "im-display-none");

    return (
      <div className="im-project-tablist">
        <div />
        <div className="im-search-bar">
          <div></div>
          <input
            className="im-search-box-input"
            placeholder="Search"
            type="text"
            id="searchInput"
            ref={this.refSearchBox}
            onChange={this.onInputChangeDebounced}
            data-testid={TEST_ID.COMPONENTS.INPUT_SEARCH_CONNECTION}
          />
          <div
            className={buttonDisplayedStyle}
            onClick={this.clearSearchTerm.bind(this)}
          >
            <i className="im-icon-Cross16 im-icon-16" />
          </div>
          <div />
        </div>
      </div>
    );
  }

  render() {
    return (
      <div tabIndex={2} className="im-full-page-scroll">
        <NavigateBack />
        <div className="im-full-page-wrapper">
          <div className="im-flex-box-items">
            {isFreeware(this.props.profile)
              ? this.renderMessage()
              : this.renderConnections()}
          </div>

          {isDebug([DEV_DEBUG]) && !isElectron() && this.renderConnections()}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    connections: state.connections,
    profile: state.profile
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleNewConnectionModal
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Connections)
);
