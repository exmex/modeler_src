import React, { Component } from "react";
import { storeSettings, updateSettingsProperty } from "../actions/settings";

import { BackupModelTime } from "../enums/enums";
import CheckboxSwitch from "../components/checkbox_switch";
import DarkBackground from "../assets/ui-dark.png";
import { DebounceInput } from "react-debounce-input";
import LightBackground from "../assets/ui-light.png";
import NavigateBack from "./navigate_back";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { toggleProxyModal } from "../actions/ui";
import { withRouter } from "react-router-dom";

const BACKUP_MODEL_TIME_FIELD = "backupModelTime";

class ConfigPage extends Component {
  async handleThemeChange(event) {
    const value = event.target.value;
    await this.props.updateSettingsProperty(value, "theme");
    await this.props.storeSettings();
  }

  async handleThemeChangeCustom(val) {
    await this.props.updateSettingsProperty(val, "theme");
    await this.props.storeSettings();
  }

  async handleUndoSteps(event) {
    const value = event.target.value;
    await this.props.updateSettingsProperty(value, "undoSteps");
    await this.props.storeSettings();
  }

  async handleShowToolbarCaptions(event) {
    await this.props.updateSettingsProperty(
      event.target.checked,
      "showToolbarCaptions"
    );
    await this.props.storeSettings();
  }

  async handleLayoutChange(event) {
    const value = event.target.value;
    await this.props.updateSettingsProperty(value, "layout");
    await this.props.storeSettings();
  }

  async handleDiagramTabsPositionChange(event) {
    const value = event.target.value;
    await this.props.updateSettingsProperty(value, "diagramTabsPosition");
    await this.props.storeSettings();
  }

  async handleReportErrorChange(event) {
    const value = event.target.value;
    await this.props.updateSettingsProperty(value, "reportError");
    await this.props.storeSettings();
  }

  async handleBackupModelTimeChange(event) {
    const value = event.target.value;
    await this.props.updateSettingsProperty(value, BACKUP_MODEL_TIME_FIELD);
    await this.props.storeSettings();
  }

  render() {
    const layout =
      this.props.settings.layout === undefined
        ? "area-center"
        : this.props.settings.layout;

    return (
      <div className="im-full-page-scroll">
        <div className="im-full-page-wrapper">
          <NavigateBack />
          <div className="im-header-1 im-align-center">Settings</div>
          <div className="im-align-center im-padding-md">
            <div>
              <h2>Theme</h2>
            </div>
            <div className="im-custom-select-wrapper">
              <div
                className="im-custom-select-left im-pointer"
                onClick={this.handleThemeChangeCustom.bind(this, "")}
              >
                <img
                  alt={
                    this.props.settings.theme
                      ? this.props.settings.theme
                      : "Light"
                  }
                  className={
                    this.props.settings.theme === ""
                      ? "im-custom-select-selected"
                      : ""
                  }
                  src={LightBackground}
                />
              </div>
              <div
                className="im-custom-select-right im-pointer"
                onClick={this.handleThemeChangeCustom.bind(this, "im-dark")}
              >
                <img
                  alt={
                    this.props.settings.theme
                      ? this.props.settings.theme
                      : "Dark"
                  }
                  className={
                    this.props.settings.theme === "im-dark"
                      ? "im-custom-select-selected"
                      : ""
                  }
                  src={DarkBackground}
                />
              </div>
            </div>

            <h2>Application settings</h2>

            <div className="im-row-form">
              <div className="im-cell">Theme:</div>
              <div className="im-cell">
                {" "}
                <select
                  style={{ width: "100%" }}
                  value={this.props.settings.theme}
                  onChange={this.handleThemeChange.bind(this)}
                >
                  <option value="">Light</option>
                  <option value="im-dark">Dark</option>
                </select>
              </div>
            </div>

            <div className="im-row-form">
              <div className="im-cell">Undo steps:</div>
              <div className="im-cell">
                {" "}
                <DebounceInput
                  style={{ width: 50 }}
                  minLength={1}
                  type="number"
                  debounceTimeout={300}
                  value={this.props.settings.undoSteps}
                  onChange={this.handleUndoSteps.bind(this)}
                />
              </div>
            </div>

            <div className="im-row-form">
              <div className="im-cell">Toolbar captions:</div>
              <div className="im-cell">
                {" "}
                <CheckboxSwitch
                  label=""
                  checked={this.props.settings.showToolbarCaptions}
                  onChange={this.handleShowToolbarCaptions.bind(this)}
                />
              </div>
            </div>

            <div className="im-row-form">
              <div className="im-cell">Side panel alignment:</div>
              <div className="im-cell">
                {" "}
                <select
                  style={{ width: "100%" }}
                  value={layout}
                  onChange={this.handleLayoutChange.bind(this)}
                >
                  <option value="area-center">Right</option>
                  <option value="area-right">Left</option>
                </select>
              </div>
            </div>

            <div className="im-row-form">
              <div className="im-cell">Diagram tabs alignment:</div>
              <div className="im-cell">
                {" "}
                <select
                  style={{ width: "100%" }}
                  value={this.props.settings.diagramTabsPosition}
                  onChange={this.handleDiagramTabsPositionChange.bind(this)}
                >
                  <option value="tabs-bottom">Bottom</option>
                  <option value="tabs-top">Top</option>
                </select>
              </div>
            </div>

            <div className="im-row-form">
              <div className="im-cell">Application error log:</div>
              <div className="im-cell">
                {" "}
                <select
                  style={{ width: "100%" }}
                  value={this.props.settings.reportError}
                  onChange={this.handleReportErrorChange.bind(this)}
                >
                  <option value="prompt">Prompt before sending</option>
                  {/*<option value="always">Always send</option>*/}
                  <option value="never">Never send</option>
                </select>
              </div>
            </div>

            <div className="im-row-form">
              <div className="im-cell">Backup project:</div>
              <div className="im-cell">
                <select
                  style={{ width: "100%" }}
                  value={this.props.settings[BACKUP_MODEL_TIME_FIELD]}
                  onChange={this.handleBackupModelTimeChange.bind(this)}
                >
                  <option value={BackupModelTime.NEVER}>Never</option>
                  <option value={BackupModelTime.FIVE_SECONDS}>
                    Every 5 seconds
                  </option>
                  <option value={BackupModelTime.MINUTE}>Every 1 minute</option>
                  <option value={BackupModelTime.FIVE_MINUTES}>
                    Every 5 minutes
                  </option>
                </select>
              </div>
            </div>

            <div className="im-row-form">
              <div className="im-cell">Proxy:</div>
              <div className="im-cell">
                <div
                  className="im-btn-link im-pointer"
                  onClick={this.props.toggleProxyModal}
                >
                  Configure settings
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    settings: state.settings
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateSettingsProperty,
        storeSettings,
        toggleProxyModal
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ConfigPage)
);
