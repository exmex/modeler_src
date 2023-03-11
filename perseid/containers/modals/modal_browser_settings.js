import React, { Component } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";

import BrowserSettings from "../../components/browser/browser_settings";
import { CSSTransition } from "react-transition-group";
import Draggable from "react-draggable";
import { TEST_ID } from "common";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { toggleBrowserSettingsModal } from "../../actions/ui";
import { withRouter } from "react-router-dom";

class ModalBrowserSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.escFunction = this.escFunction.bind(this);
  }

  escFunction(event) {
    if (event.keyCode === 27) {
      if (this.props.noteModalIsDisplayed === true) {
        this.props.toggleNoteModal();
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
    this.props.toggleBrowserSettingsModal();
  }

  noChange() {
    return null;
  }

  render() {
    if (this.props.browserSettingsModalIsDisplayed === true) {
      return (
        <CSSTransition
          in={this.props.browserSettingsModalIsDisplayed}
          key="modalBrowserSettings"
          classNames="fade"
          unmountOnExit
          timeout={{ enter: 500, exit: 100 }}
        >
          <Draggable handle=".modal-header">
            <div
              className="modal"
              data-testid={TEST_ID.MODALS.BROWSER_SETTINGS}
            >
              <div className="modal-header">Side navigation settings</div>
              <div className="modal-content">
                <Tabs className="im-tabs">
                  <div className="im-tabs-grid">
                    <div className="im-tabs-tablist">
                      <TabList>
                        <Tab>Items</Tab>
                      </TabList>
                    </div>

                    <div className="im-tabs-area">
                      <TabPanel className="tabDetails im-tab-panel">
                        <BrowserSettings />
                      </TabPanel>
                    </div>
                  </div>
                </Tabs>
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
        </CSSTransition>
      );
    } else {
      return "";
    }
  }
}

function mapStateToProps(state) {
  return {
    browserSettingsModalIsDisplayed: state.ui.browserSettingsModalIsDisplayed,
    browserSettings: state.ui.browserSettings,
    type: state.model.type
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleBrowserSettingsModal
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalBrowserSettings)
);
