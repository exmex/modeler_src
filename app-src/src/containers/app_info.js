import React, { Component } from "react";
import {
  getRemainingTrialDays,
  hasLicense,
  isFreeware
} from "../helpers/features/features";

import { TEST_ID } from "common";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

class AppInfo extends Component {
  renderTrial() {
    if (hasLicense(this.props.profile)) {
      return (
        <div className="im-row-form">
          <div className="im-cell">Type:</div>
          <div className="im-cell" data-testid={TEST_ID.LICENSE_TYPE}>
            Commercial
          </div>
        </div>
      );
    } else {
      if (isFreeware(this.props.profile)) {
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
                {getRemainingTrialDays(this.props.profile)}
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

export default withRouter(connect(mapStateToProps)(AppInfo));
