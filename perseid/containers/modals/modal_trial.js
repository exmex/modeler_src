import React, { Component } from "react";

import BuyNow from "../buy_now";
import { CSSTransition } from "react-transition-group";
import Draggable from "react-draggable";
import License from "../license";
import { TEST_ID } from "common";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { isPerseid } from "../../helpers/features/features";
import { toggleTrialModal } from "../../actions/ui";
import { withRouter } from "react-router-dom";

const ipcRenderer = window?.ipcRenderer;

class ModalTrial extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidUpdate() {
    if (this.props.profile && this.props.profile.licInfo.key !== "") {
      if (this.props.trialModalIsDisplayed === true) {
        this.props.toggleTrialModal();
      } else {
      }
    }
  }

  onConfirmClick() {
    this.props.toggleTrialModal();
  }

  onCloseClick() {
    if (ipcRenderer) {
      ipcRenderer.send("app:quit", "just quit");
    } else {
      this.props.toggleTrialModal();
    }
  }

  getTrialMessage() {
    if (isPerseid(this.props.profile)) {
      return `The trial period of 14 days has already ended.`;
    } else {
      return `Now you can continue with limited freeware version or buy a
license.`;
    }
  }

  getRemaining() {
    if (this.props.profile && this.props.profile.licInfo.key !== "") {
      return "";
    } else {
      if (
        this.props.profile &&
        this.props.profile.appInfo &&
        this.props.profile.appInfo.remainingDays > 0
      ) {
        return (
          <div className="im-align-center im-padding-md">
            <h2>Trial version will expire soon</h2>
            <p>
              Remaining days: {" " + this.props.profile.appInfo.remainingDays}
            </p>
          </div>
        );
      } else if (
        this.props.profile &&
        this.props.profile.appInfo &&
        this.props.profile.appInfo.remainingDays <= 0
      ) {
        /*
         return (
          <div className="im-align-center im-padding-md">
            <h2>Trial version has expired!</h2>
            <p>
              Now you can continue with limited freeware version or buy a
              license.
            </p>
          </div>
        );
        */
        return (
          <div className="im-align-center im-padding-md">
            <h2>Trial version has expired!</h2>
            <p>{this.getTrialMessage()}</p>
          </div>
        );
      }
    }
  }

  getHeader() {
    let message = "";
    if (this.props.profile && this.props.profile.licInfo.key !== "") {
      message += "Commercial version";
      //message += "Beta version";
    } else {
      message += "Trial version";
      //message += "Beta version";
    }
    return message;
  }

  getModalButton() {
    if (this.props.profile && this.props.profile.licInfo.key !== "") {
      return (
        <button
          className="im-btn-default"
          onClick={this.onConfirmClick.bind(this)}
        >
          Continue
        </button>
      );
    } else {
      if (
        this.props.profile &&
        this.props.profile.appInfo &&
        this.props.profile.appInfo.remainingDays > 0
      ) {
        return (
          <button
            className="im-btn-default"
            onClick={this.onConfirmClick.bind(this)}
            data-testid={TEST_ID.MODAL_TRIAL.CONTINUE_WITH_TRIAL_BUTTON}
          >
            {/*Continue trial*/}
            Continue using trial
          </button>
        );
      } else if (
        this.props.profile &&
        this.props.profile.appInfo &&
        this.props.profile.appInfo.remainingDays <= 0
      ) {
        if (isPerseid(this.props.profile)) {
          return (
            <button
              className="im-btn-default"
              data-testid={TEST_ID.CLOSE_NO_FREEWARE_BUTTON}
              onClick={this.onCloseClick.bind(this)}
            >
              Close
            </button>
          );
        } else {
          return (
            <button
              className="im-btn-default"
              data-testid={TEST_ID.MODAL_TRIAL.CONTINUE_WITH_FREEWARE_BUTTON}
              onClick={this.onConfirmClick.bind(this)}
            >
              Continue with freeware
              {/*Continue using BETA*/}
            </button>
          );
        }
      }
    }
  }

  render() {
    if (this.props.trialModalIsDisplayed === true) {
      return (
        <CSSTransition
          in={this.props.trialModalIsDisplayed}
          key="confirmTrialDialog"
          classNames="fade"
          unmountOnExit
          timeout={{ enter: 500, exit: 100 }}
        >
          <div className="modal-wrapper">
            <Draggable handle=".modal-header">
              <div
                className="modal modal-confirm"
                data-testid={TEST_ID.MODALS.TRIAL}
              >
                <div className="modal-header">{this.getHeader()}</div>
                <div className="modal-content">
                  <div className="im-content-spacer-md" />
                  {this.getRemaining()}

                  <BuyNow />
                  <License />
                  <div className="im-content-spacer-md" />
                  <div className="im-content-spacer-md" />
                </div>
                <div className="modal-footer">{this.getModalButton()}</div>
              </div>
            </Draggable>
          </div>
        </CSSTransition>
      );
    } else {
      return null;
    }
  }
}

function mapStateToProps(state) {
  return {
    trialModalIsDisplayed: state.ui.trialModalIsDisplayed,
    profile: state.profile
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleTrialModal
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalTrial)
);
