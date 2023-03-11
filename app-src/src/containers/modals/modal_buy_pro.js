import React, { Component } from "react";
import { TEST_ID, getAppTitle } from "common";
import {
  isBasicLuna,
  isBasicMoon,
  isFreeware,
  isMoon
} from "../../helpers/features/features";

import BuyNow from "../buy_now";
import { CSSTransition } from "react-transition-group";
import Draggable from "react-draggable";
import UpgradeNow from "../upgrade_now";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { toggleBuyProModal } from "../../actions/ui";
import { withRouter } from "react-router-dom";

class ModalBuyPro extends Component {
  constructor(props) {
    super(props);
    this.escFunction = this.escFunction.bind(this);
  }

  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }

  async escFunction(event) {
    if (event.keyCode === 27) {
      if (this.props.buyProModalIsDisplayed === true) {
        this.props.toggleBuyProModal();
      }
    }
  }

  onCloseButtonClicked() {
    this.props.toggleBuyProModal();
  }

  renderMessage() {
    return (
      <>
        <div className="im-align-center im-padding-md">
          <h2>
            {getAppTitle(process.env.REACT_APP_PRODUCT)} - Professional edition
          </h2>
          <p>
            HTML reports can be created in the <b>Professional edition</b> of{" "}
            {getAppTitle(process.env.REACT_APP_PRODUCT)}.
          </p>

          <BuyNow />
        </div>
      </>
    );
  }

  render() {
    if (this.props.buyProModalIsDisplayed === true) {
      return (
        <CSSTransition
          in={this.props.buyProModalIsDisplayed}
          key="ModalBuyPro"
          classNames="fade"
          unmountOnExit
          timeout={{ enter: 500, exit: 100 }}
        >
          <div className="modal-wrapper">
            <Draggable handle=".modal-header">
              <div
                className="modal modal-confirm"
                data-testid={TEST_ID.MODALS.BUY_PRO}
              >
                <div className="modal-header">
                  Feature available in the Professional edition
                </div>
                <div className="modal-content-confirm">
                  <div>
                    {(isBasicMoon(this.props.profile) ||
                      isBasicLuna(this.props.profile)) && <UpgradeNow />}
                    {isFreeware(this.props.profile) && this.renderMessage()}
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="im-btn-default"
                    onClick={this.onCloseButtonClicked.bind(this)}
                    data-testid={TEST_ID.MODAL_BUY_PRO.CLOSE}
                  >
                    Close
                  </button>
                </div>
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
    buyProModalIsDisplayed: state.ui.buyProModalIsDisplayed,
    profile: state.profile
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleBuyProModal
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalBuyPro)
);
