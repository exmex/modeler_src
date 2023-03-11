import React, { Component } from "react";

import AppInfo from "./app_info";
import BuyNow from "./buy_now";
import License from "./license";
import NavigateBack from "./navigate_back";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { fetchModel } from "../actions/model";
import { toggleNewModelModal } from "../actions/ui";
import { withRouter } from "react-router-dom";

class Account extends Component {
  render() {
    return (
      <div className="im-full-page-scroll">
        <div className="im-full-page-wrapper">
          <NavigateBack />
          <div className="im-header-1 im-align-center">My Account</div>

          {this.props.profile.licInfo.key === "" && <BuyNow />}
          <AppInfo />
          <License />
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
