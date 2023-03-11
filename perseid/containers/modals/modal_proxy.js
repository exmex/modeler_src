import React, { Component } from "react";
import { saveSettings, updateSettingsProperty } from "../../actions/settings";

import CheckboxSwitch from "../../components/checkbox_switch";
import { DebounceInput } from "react-debounce-input";
import Draggable from "react-draggable";
import Helpers from "../../helpers/helpers";
import { TEST_ID } from "common";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { toggleProxyModal } from "../../actions/ui";
import { withRouter } from "react-router-dom";

const PROXY_PROPERTY = "proxy";
class ModalProxy extends Component {
  constructor(props) {
    super(props);
    this.state = { pwdDisplayed: false };
    this.escFunction = this.escFunction.bind(this);
    this.renderProxyForm = this.renderProxyForm.bind(this);
  }

  escFunction(event) {
    if (event.keyCode === 27) {
      if (this.props.proxyModalIsDisplayed === true) {
        this.props.toggleProxyModal();
      }
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }

  onShowModalClick() {
    this.props.toggleProxyModal();
  }

  async handleTextChange(propName, event) {
    await this.props.updateSettingsProperty(
      { ...this.props.settings.proxy, [propName]: event.target.value },
      PROXY_PROPERTY
    );
    saveSettings(this.props.settings);
  }

  async handleCheckChange(propName, event) {
    await this.props.updateSettingsProperty(
      { ...this.props.settings.proxy, [propName]: event.target.checked },
      PROXY_PROPERTY
    );
    saveSettings(this.props.settings);
  }

  handleCheckboxChange(propName, event) {
    this.setState({ [propName]: event.target.checked });
  }

  renderProxyForm() {
    return (
      <div className="im-modal-content">
        <div className="im-properties-grid">
          <div></div>
          <CheckboxSwitch
            label={"Use proxy"}
            checked={Helpers.gch(this.props.settings.proxy?.enabled)}
            onChange={this.handleCheckChange.bind(this, "enabled")}
          />
          <div>
            Host:<span className="im-input-tip"> (required)</span>
          </div>
          <DebounceInput
            type="text"
            debounceTimeout={300}
            value={Helpers.gv(this.props.settings.proxy?.host)}
            onChange={this.handleTextChange.bind(this, "host")}
          />
          <div>
            Port:<span className="im-input-tip"> (required)</span>
          </div>
          <DebounceInput
            type="text"
            debounceTimeout={300}
            value={Helpers.gv(this.props.settings.proxy?.port)}
            onChange={this.handleTextChange.bind(this, "port")}
          />
          <div>User name:</div>
          <DebounceInput
            type="text"
            debounceTimeout={300}
            value={Helpers.gv(this.props.settings.proxy?.username)}
            onChange={this.handleTextChange.bind(this, "username")}
          />
          <div>Password:</div>
          <DebounceInput
            type={this.state.pwdDisplayed ? "text" : "password"}
            debounceTimeout={300}
            value={Helpers.gv(this.props.settings.proxy?.password)}
            onChange={this.handleTextChange.bind(this, "password")}
          />
        </div>
      </div>
    );
  }

  render() {
    if (this.props.proxyModalIsDisplayed === true) {
      return (
        <Draggable handle=".modal-header">
          <div
            className="modal modal-confirm modal-proxy"
            data-testid={TEST_ID.MODALS.PROXY}
          >
            <div className="modal-header">Proxy settings</div>
            <div className="modal-content-confirm">
              {this.renderProxyForm()}
            </div>
            <div className="modal-footer">
              <button
                autoFocus
                className="im-btn-default"
                onClick={this.onShowModalClick.bind(this)}
              >
                Close
              </button>
            </div>
          </div>
        </Draggable>
      );
    } else {
      return null;
    }
  }
}

function mapStateToProps(state) {
  return {
    proxyModalIsDisplayed: state.ui.proxyModalIsDisplayed,
    settings: state.settings
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleProxyModal,
        updateSettingsProperty
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalProxy)
);
