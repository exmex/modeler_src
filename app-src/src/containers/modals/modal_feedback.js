import React, { Component } from "react";
import { TEST_ID, getAppVersion } from "common";

import CheckboxSwitch from "../../components/checkbox_switch";
import { DebounceInput } from "react-debounce-input";
import Draggable from "react-draggable";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import isElectron from "is-electron";
import packageJson from "../../../package.json";
import { toggleFeedbackModal } from "../../actions/ui";
import { withRouter } from "react-router-dom";

const INIT_STATE = {
  customMessage: "",
  email: "",
  userName: "",
  messageSent: false,
  gotSuccessResponse: null,
  consent: true
};

const ipcRenderer = window?.ipcRenderer;

class ModalFeedback extends Component {
  constructor(props) {
    super(props);
    this.state = INIT_STATE;
    this.escFunction = this.escFunction.bind(this);
    this.renderForm = this.renderForm.bind(this);
    this.renderSuccess = this.renderSuccess.bind(this);
    this.renderError = this.renderError.bind(this);
  }

  openBrowser(url) {
    if (isElectron()) {
      ipcRenderer.send("link:openExternal", url);
    }
  }

  escFunction(event) {
    if (event.keyCode === 27) {
      if (this.props.feedbackModalIsDisplayed === true) {
        this.props.toggleFeedbackModal();
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
    this.setState(INIT_STATE);
    this.props.toggleFeedbackModal();
  }

  handleTextChange(propName, event) {
    this.setState({ [propName]: event.target.value });
  }

  handleCheckboxChange(propName, event) {
    this.setState({ [propName]: event.target.checked });
  }

  async sendMessage() {
    const data_message = {
      user: this.state.userName,
      email: this.state.email,
      message: this.state.customMessage,
      product: packageJson.name,
      version: getAppVersion(process.env.REACT_APP_PRODUCT),
      license: this.props.licInfo.licType
    };

    const data_message_string = JSON.stringify(data_message);
    const URL = "https://www.datensen.com/feedback/feedbackpost.php";

    const myInit = {
      method: "POST",
      body: data_message_string
      //mode: "no-cors"
    };

    const myRequest = new Request(URL, myInit);

    await fetch(myRequest)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.data === "OK") {
          this.setState({ gotSuccessResponse: true });
        } else {
          this.setState({ gotSuccessResponse: false });
        }
      })
      .catch((error) => {
        this.setState({ gotSuccessResponse: false });
      });

    this.setState({ messageSent: true });
  }

  renderForm() {
    var buttonStyle;

    if (this.state.consent === false || this.state.customMessage.length < 1) {
      buttonStyle = "im-btn-default im-margin-right im-disabled";
    } else {
      buttonStyle = "im-btn-default  im-margin-right";
    }
    return (
      <div className="im-feedback-content">
        <div className="im-feedback-title">
          Do you have any suggestions how to make the app better?
        </div>
        <div className="im-feedback-subtitle">
          Help us better understand what you like, what you feel should be
          improved and what's missing completely.
        </div>
        <div className="im-content-spacer-lg"></div>

        <div className="im-feedback-grid">
          <div>Your name (optional):</div>
          <DebounceInput
            type="text"
            debounceTimeout={300}
            value={this.state.userName}
            onChange={this.handleTextChange.bind(this, "userName")}
          />
          <div>Email address (optional):</div>
          <DebounceInput
            type="text"
            debounceTimeout={300}
            value={this.state.email}
            onChange={this.handleTextChange.bind(this, "email")}
          />
          <div>Your feedback:</div>
          <DebounceInput
            element="textarea"
            debounceTimeout={300}
            className="im-textarea"
            value={this.state.customMessage}
            onChange={this.handleTextChange.bind(this, "customMessage")}
          />
          <div></div>
          <div>
          <CheckboxSwitch
            label={"I agree to the "}
            checked={this.state.consent}
            onChange={this.handleCheckboxChange.bind(this, "consent")}
            className={" im-display-inline-block "}
          />
          <div className="im-display-inline-block">&nbsp;</div>
          <button
              className="im-btn-link im-display-inline-block"
              onClick={this.openBrowser.bind(
                this,
                "https://www.datensen.com/target/policy"
              )}
            >
            {" privacy policy "}
            </button>
            <div className="im-display-inline-block">&nbsp;</div>
            <div className="im-display-inline-block">and you can contact me.</div>
          </div>
          <div className="im-content-spacer-lg"></div>
          <div className="im-content-spacer-lg"></div>
          <div className="im-content-spacer-lg"></div>
          <button
            disabled={
              !this.state.consent || this.state.customMessage.length < 1
            }
            className={buttonStyle}
            onClick={this.sendMessage.bind(this)}
          >
            SEND FEEDBACK
          </button>
        </div>
      </div>
    );
  }

  renderResult() {
    return this.state.gotSuccessResponse
      ? this.renderSuccess()
      : this.renderError();
  }

  renderSuccess() {
    return (
      <div className="im-feedback-content">
        <h1>Thank you!</h1>
        <div>Your message has been sent.</div>
      </div>
    );
  }

  renderError() {
    return (
      <div className="im-feedback-content">
        <h1>We are sorry!</h1>
        <div>
          Your message could not be sent. Please send us a message to{" "}
          <a className="im-link" href="mailto:info@datensen.com">
            info@datensen.com
          </a>
          .
        </div>
      </div>
    );
  }

  render() {
    if (this.props.feedbackModalIsDisplayed === true) {
      return (
        <Draggable handle=".modal-header">
          <div
            className="modal modal-confirm"
            data-testid={TEST_ID.MODALS.FEEDBACK}
          >
            <div className="modal-header">Send us your feedback!</div>
            <div className="modal-content-confirm">
              {this.state.messageSent === false
                ? this.renderForm()
                : this.renderResult()}
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
    feedbackModalIsDisplayed: state.ui.feedbackModalIsDisplayed,
    licInfo: state.profile.licInfo
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleFeedbackModal
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalFeedback)
);
