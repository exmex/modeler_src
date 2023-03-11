import React, { Component } from "react";

import { TEST_ID } from "common";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { fetchModel } from "../actions/model";
import { fetchProfileLicense } from "../actions/profile";
import { toggleNewModelModal } from "../actions/ui";
import { withRouter } from "react-router-dom";

class AppInfo extends Component {
  renderTrial() {
    if (this.props.profile.licInfo.key !== "") {
      return (
        <div className="im-row-form">
          <div className="im-cell">Type:</div>
          <div className="im-cell" data-testid={TEST_ID.LICENSE_TYPE}>
            Commercial
          </div>
        </div>
      );
    } else {
      if (this.props.profile.appInfo.remainingDays < 1) {
        return (
          <section>
            <div className="im-row-form">
              <div className="im-cell">Type:</div>
              <div className="im-cell" data-testid={TEST_ID.LICENSE_TYPE}>
                Freeware with limited features
              </div>
            </div>
          </section>
        );
      } else {
        return (
          <section>
            <div className="im-row-form">
              <div className="im-cell">Type:</div>
              <div className="im-cell" data-testid={TEST_ID.LICENSE_TYPE}>
                Trial
              </div>
            </div>
            <div className="im-row-form">
              <div className="im-cell">Days remaining:</div>
              <div className="im-cell" data-testid={TEST_ID.REMAINING_DAYS}>
                {this.props.profile.appInfo.remainingDays}
              </div>
            </div>
          </section>
        );
      }
    }
  }

  render() {
    return (
      <div className="im-align-center im-padding-md">
        <h2>Application information</h2>

        <div className="im-row-form">
          <div className="im-cell">Version:</div>
          <div className="im-cell">{this.props.profile.appInfo.appVersion}</div>
        </div>

        {this.renderTrial()}
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
        toggleNewModelModal: toggleNewModelModal,

        fetchProfileLicense: fetchProfileLicense
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(AppInfo)
);
