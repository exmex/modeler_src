import {
  Features,
  getRemainingTrialDays,
  hasLicense,
  isExpiredApp,
  isFeatureAvailable,
  isMeteor,
  isTrial
} from "../../helpers/features/features";
import React, { Component } from "react";

import BuyNow from "../buy_now";
import { CSSTransition } from "react-transition-group";
import Draggable from "react-draggable";
import License from "../license";
import { TEST_ID } from "common";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { toggleTrialModal } from "../../actions/ui";
import { withRouter } from "react-router-dom";

const ipcRenderer = window?.ipcRenderer;

class ModalTrial extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidUpdate() {
    if (hasLicense(this.props.profile)) {
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
    if (isMeteor(this.props.profile)) {
      return `Now you can continue with limited freeware version or buy a
      license.`;
    } else {
      return `The trial period of 14 days has already ended.`;
    }
  }

  getRemaining() {
    if (hasLicense(this.props.profile)) {
      return "";
    } else {
      if (isExpiredApp(this.props.profile)) {
        return (
          <div className="im-align-center im-padding-md">
            <h2>Application expiration</h2>
            <p>
              This version has expired. Visit www.datensen.com and download the
              latest version.
            </p>
          </div>
        );
      } else if (getRemainingTrialDays(this.props.profile) > 0) {
        return (
          <div className="im-align-center im-padding-md">
            <h2>Trial version will expire soon</h2>
            <p>
              Remaining days: {" " + getRemainingTrialDays(this.props.profile)}
            </p>
          </div>
        );
      } else if (getRemainingTrialDays(this.props.profile) <= 0) {
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
    return hasLicense(this.props.profile)
      ? "Commercial version"
      : isExpiredApp(this.props.profile)
      ? "Application expired"
      : "Trial version";
  }

  getModalButton() {
    if (hasLicense(this.props.profile)) {
      return this.renderContinueButton();
    } else {
      if (isTrial(this.props.profile)) {
        return this.renderContinueUsingTrial();
      } else if (
        !isExpiredApp(this.props.profile) &&
        isFeatureAvailable(
          this.props.profile.availableFeatures,
          Features.FREEWARE
        )
      ) {
        return this.renderContinueUsingFreeware();
      } else {
        return this.renderCloseButton();
      }
    }
  }

  renderCloseButton() {
    return (
      <button
        className="im-btn-default"
        data-testid={TEST_ID.MODAL_TRIAL.CLOSE_NO_FREEWARE_BUTTON}
        onClick={this.onCloseClick.bind(this)}
      >
        Close
      </button>
    );
  }

  renderContinueUsingFreeware() {
    return (
      <button
        className="im-btn-default"
        data-testid={TEST_ID.MODAL_TRIAL.CONTINUE_WITH_FREEWARE_BUTTON}
        onClick={this.onConfirmClick.bind(this)}
      >
        Continue with freeware
      </button>
    );
  }

  renderContinueUsingTrial() {
    return (
      <button
        className="im-btn-default"
        onClick={this.onConfirmClick.bind(this)}
        data-testid={TEST_ID.MODAL_TRIAL.CONTINUE_WITH_TRIAL_BUTTON}
      >
        Continue using trial
      </button>
    );
  }

  renderContinueButton() {
    return (
      <button
        className="im-btn-default"
        onClick={this.onConfirmClick.bind(this)}
      >
        Continue
      </button>
    );
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
                  {!isExpiredApp(this.props.profile) && <BuyNow />}
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
