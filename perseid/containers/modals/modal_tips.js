import React, { Component } from "react";
import { isMeteor, isMoon, isPerseid } from "../../helpers/features/features";
import { storeSettings, updateSettingsProperty } from "../../actions/settings";

import { CSSTransition } from "react-transition-group";
import CarouselTips from "../../components/carousel_tips";
import CarouselTipsMeteor from "../../components/carousel_tips_meteor";
import CarouselTipsPerseid from "../../components/carousel_tips_perseid";
import CheckboxSwitch from "../../components/checkbox_switch";
import Draggable from "react-draggable";
import { TEST_ID } from "common";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { toggleTipsModal } from "../../actions/ui";

class ModalTips extends Component {
  constructor(props) {
    super(props);
    this.escFunction = this.escFunction.bind(this);
    this.state = { showTipsState: this.props.showTips };
  }

  componentDidUpdate(prevProps) {
    if (this.props.showTips !== prevProps.showTips) {
      this.setState({ showTipsState: this.props.showTips });
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }

  async escFunction(event) {
    if (event.keyCode === 27) {
      if (this.props.tipsModalIsDisplayed === true) {
        this.props.toggleTipsModal();
      }
    }
  }

  async onCloseButtonClicked() {
    await this.props.updateSettingsProperty(
      this.state.showTipsState,
      "showTips"
    );
    this.props.storeSettings();
    this.props.toggleTipsModal();
  }

  handleShowTipsCheckbox() {
    this.setState({ showTipsState: !this.state.showTipsState });
  }

  render() {
    if (this.props.tipsModalIsDisplayed === true) {
      return (
        <CSSTransition
          in={this.props.tipsModalIsDisplayed}
          key="ModalTips"
          classNames="fade"
          unmountOnExit
          timeout={{ enter: 500, exit: 100 }}
        >
          <div className="modal-wrapper">
            <Draggable handle=".modal-header">
              <div
                className="modal modal-limited-width modal-noresize"
                data-testid={TEST_ID.MODALS.TIPS}
              >
                <div className="modal-header">Key features and tips</div>
                <div className="modal-content">
                  <div>
                    {isMeteor(this.props.profile) && <CarouselTipsMeteor />}
                    {isMoon(this.props.profile) && <CarouselTips />}
                    {isPerseid(this.props.profile) && <CarouselTipsPerseid />}
                  </div>
                </div>

                <div className="modal-footer">
                  <div className="im-display-inline-block im-float-left im-p-sm">
                    <div className="im-align-left">
                      <CheckboxSwitch
                        label="Show this panel on startup"
                        checked={this.state.showTipsState}
                        onChange={this.handleShowTipsCheckbox.bind(this)}
                      />
                    </div>
                  </div>

                  <button
                    className="im-btn-default"
                    onClick={this.onCloseButtonClicked.bind(this)}
                    data-testid={TEST_ID.MODAL_TIPS.CLOSE}
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
    tipsModalIsDisplayed: state.ui.tipsModalIsDisplayed,
    showTips: state.settings.showTips,
    profile: state.profile
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleTipsModal,
        updateSettingsProperty,
        storeSettings
      },
      dispatch
    ),
    dispatch
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalTips);
