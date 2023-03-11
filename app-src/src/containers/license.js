import React, { Component } from "react";
import {
  fetchProfileFeatures,
  fetchProfileLicense,
  getFeaturesForProfile
} from "../actions/profile";
import {
  hasLicense,
  isBasicLuna,
  isBasicMoon
} from "../helpers/features/features";

import { DebounceInput } from "react-debounce-input";
import Helpers from "../helpers/helpers";
import { TEST_ID } from "common";
import UpgradeNow from "./upgrade_now";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import isElectron from "is-electron";
import { toggleProxyModal } from "../actions/ui";
import { withRouter } from "react-router-dom";

const ipcRenderer = window?.ipcRenderer;
class License extends Component {
  constructor(props) {
    super(props);

    this.activateLicense = this.activateLicense.bind(this);
    this.state = {
      licenseKeyFieldValue: "",
      error: "",
      isActivating: false
    };
  }

  handleChangeLicenseKeyFieldValue(event) {
    let trimmed_license_key = event.target.value.trim();
    this.setState({ licenseKeyFieldValue: trimmed_license_key });
    event.preventDefault();
  }

  activateLicense() {
    if (isElectron()) {
      this.setState({ error: "", isActivating: true }, () => {
        ipcRenderer.once("license:updated", (event, result) => {
          if (result.error) {
            this.setState({ error: result.error });
          } else {
            const licenseData = result.content;
            this.props.fetchProfileLicense(licenseData);
            this.props.fetchProfileFeatures(
              getFeaturesForProfile(this.props.profile)
            );
          }
          this.setState({ isActivating: false });
        });
        ipcRenderer.send("license:save", this.state.licenseKeyFieldValue);
      });
    }
  }

  renderLicense() {
    return (
      <div className="im-align-center im-padding-md">
        <h2>License key information</h2>
        <div className="im-row-form">
          <div className="im-cell">Product:</div>
          <div className="im-cell" data-testid={TEST_ID.PRODUCT_TYPE}>
            {this.props.profile.licInfo.purchase.product_name}
          </div>
        </div>
        <div className="im-row-form">
          <div className="im-cell">Email:</div>
          <div className="im-cell">
            {this.props.profile.licInfo.purchase.email}
          </div>
        </div>
        <div className="im-row-form">
          <div className="im-cell">Key:</div>
          <div className="im-cell">{this.props.profile.licInfo.key}</div>
        </div>
        <div className="im-row-form">
          <div className="im-cell">Purchased:</div>
          <div className="im-cell">
            {Helpers.formatDate(this.props.profile.licInfo.purchase.created_at)}
          </div>
        </div>
      </div>
    );
  }

  renderNoLicense() {
    var disabledButton =
      this.state.licenseKeyFieldValue === "" || this.state.isActivating
        ? true
        : false;
    var buttonStyle = disabledButton
      ? "im-btn-default im-disabled"
      : "im-btn-default";

    return (
      <div className="im-align-center im-padding-md">
        <h2>License key activation</h2>
        <p>Enter the license key to the field below and click Activate.</p>

        <DebounceInput
          data-testid={TEST_ID.LICENSE.LICENSE_KEY_INPUT}
          minLength={1}
          debounceTimeout={300}
          placeholder="License key"
          className="input-text-md"
          value={this.state.licenseKeyFieldValue}
          type="text"
          onChange={this.handleChangeLicenseKeyFieldValue.bind(this)}
        />
        <div className="im-content-spacer-md" />

        <button
          data-testid={TEST_ID.LICENSE.ACTIVATE_BUTTON}
          disabled={disabledButton}
          className={buttonStyle}
          type="submit"
          onClick={this.activateLicense}
        >
          Activate
        </button>
        <div className="im-content-spacer-md" />
        {this.state.error !== "" ? (
          <div data-testid={TEST_ID.LICENSE.LICENSE_ERROR} className="im-error">
            {this.state.error}
            <br />
            Please make sure you are connected to the internet. <br />
            If you are using proxy,
            <div
              className="im-btn-link im-pointer"
              onClick={this.props.toggleProxyModal.bind(this)}
            >
              configure settings
            </div>
            .
          </div>
        ) : (
          ""
        )}
      </div>
    );
  }

  render() {
    return (
      <div>
        <div>
          {hasLicense(this.props.profile)
            ? this.renderLicense()
            : this.renderNoLicense()}

          {(isBasicMoon(this.props.profile) ||
            isBasicLuna(this.props.profile)) && <UpgradeNow />}

          {(isBasicMoon(this.props.profile) ||
            isBasicLuna(this.props.profile)) &&
            this.renderNoLicense()}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    profile: state.profile,
    ui: state.ui
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        fetchProfileLicense,
        fetchProfileFeatures,
        toggleProxyModal
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(License)
);
