import React, { Component } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";

import { CSSTransition } from "react-transition-group";
import CheckboxSwitch from "../../components/checkbox_switch";
import ConnectionProperties from "../connection_properties";
import Draggable from "react-draggable";
import { TEST_ID } from "common";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { selectConnection } from "../../actions/connections";
import { toggleConnectionModal } from "../../actions/ui";
import { withRouter } from "react-router-dom";

class ModalConnection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      pwdDisplayed: false
    };
    this.escFunction = this.escFunction.bind(this);
  }

  async escFunction(event) {
    if (event.keyCode === 27) {
      if (this.props.connectionModalIsDisplayed === true) {
        this.props.toggleConnectionModal();
      }
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }

  async onShowModalClick() {
    this.props.selectConnection(null);
    this.props.toggleConnectionModal();
  }

  render() {
    if (this.props.connectionModalIsDisplayed === true) {
      return (
        <CSSTransition
          in={this.props.connectionModalIsDisplayed}
          key="ModalConnection"
          classNames="fade"
          unmountOnExit
          timeout={{ enter: 500, exit: 100 }}
        >
          <div className="modal-wrapper">
            <Draggable handle=".modal-header">
              <div
                className="modal modal"
                data-testid={TEST_ID.MODALS.CONNECTION}
              >
                <div className="modal-header">Connection</div>
                <div className="modal-content">
                  <Tabs className="im-tabs">
                    <div className="im-tabs-grid">
                      <div className="im-tabs-tablist">
                        <TabList>
                          <Tab>Connection Details</Tab>
                        </TabList>
                      </div>

                      <div className="im-tabs-area">
                        <TabPanel className="tabDetails im-tab-panel">
                          {
                            <ConnectionProperties
                              pwdDisplayed={this.state.pwdDisplayed}
                            />
                          }
                        </TabPanel>
                      </div>
                    </div>
                  </Tabs>
                </div>

                <div className="modal-footer">
                  <div className="im-display-none im-float-left im-p-sm">
                    <div className="im-align-left">
                      <CheckboxSwitch
                        label="Show passwords"
                        checked={this.state.pwdDisplayed}
                        onChange={() =>
                          this.setState({
                            pwdDisplayed: !this.state.pwdDisplayed
                          })
                        }
                      />
                    </div>
                  </div>

                  <button
                    autoFocus
                    className="im-btn-default im-margin-right"
                    onClick={() =>
                      this.setState(
                        { pwdDisplayed: false },
                        this.onShowModalClick.bind(this)
                      )
                    }
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
    modelModalIsDisplayed: state.ui.modelModalIsDisplayed,
    connectionModalIsDisplayed: state.ui.connectionModalIsDisplayed
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleConnectionModal,
        selectConnection
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalConnection)
);
