import React, { Component } from "react";

import AppInfo from "./app_info";
import BuyNow from "./buy_now";
import License from "./license";
import NavigateBack from "./navigate_back";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { fetchModel } from "../actions/model";
import { hasLicense } from "../helpers/features/features";
import isElectron from "is-electron";
import { toggleNewModelModal } from "../actions/ui";
import { withRouter } from "react-router-dom";

const ipcRenderer = window?.ipcRenderer;

class Account extends Component {
  openBrowser(url) {
    if (isElectron()) {
      ipcRenderer.send("link:openExternal", url);
    }
  }

  render() {
    return (
      <div className="im-full-page-scroll">
        <div className="im-full-page-wrapper">
          <NavigateBack />
          <div className="im-header-1 im-align-center">My Account</div>

          {!hasLicense(this.props.profile) && <BuyNow />}
          <AppInfo />
          <License />
          <div className="im-align-center im-content-spacer-lg">
            <div className="im-content-spacer-lg" />
            <p className="im-text-secondary">
              Copyright: 2023 Ideamerit s.r.o. All rights reserved. <br />
              This tool was created with passion and with{" "}
              <button
                className="im-btn-link im-size-12"
                onClick={this.openBrowser.bind(
                  this,
                  "https://www.datensen.com/target/credits"
                )}
              >
                {" "}
                open source software
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    profile: state.profile
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        fetchModel: fetchModel,
        toggleNewModelModal: toggleNewModelModal
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Account)
);
