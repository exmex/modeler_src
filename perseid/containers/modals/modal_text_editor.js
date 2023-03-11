import React, { Component } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";

import { CSSTransition } from "react-transition-group";
import { DebounceInput } from "react-debounce-input";
import Draggable from "react-draggable";
import { TEST_ID } from "common";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { toggleTextEditorModal } from "../../actions/ui";
import { withRouter } from "react-router-dom";

class ModalTextEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.escFunction = this.escFunction.bind(this);
  }

  escFunction(event) {
    if (event.keyCode === 27) {
      if (this.props.textEditorModalIsDisplayed === true) {
        this.props.toggleTextEditorModal();
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
    this.props.toggleTextEditorModal();
  }

  noChange() {
    return null;
  }

  render() {
    if (this.props.textEditorModalIsDisplayed === true) {
      return (
        <CSSTransition
          in={this.props.textEditorModalIsDisplayed}
          key="modalLine"
          classNames="fade"
          unmountOnExit
          timeout={{ enter: 500, exit: 100 }}
        >
          <Draggable handle=".modal-header">
            <div className="modal" data-testid={TEST_ID.MODALS.TEXT_EDITOR}>
              <div className="modal-header">{this.props.modalHeader}</div>
              <div className="modal-content">
                <Tabs className="im-tabs">
                  <div className="im-tabs-grid">
                    <div className="im-tabs-tablist">
                      <TabList>
                        <Tab>{this.props.tabCaption || "Value"}</Tab>
                      </TabList>
                    </div>

                    <div className="im-tabs-area">
                      <TabPanel className="tabDetails im-tab-panel">
                        <div className="im-properties-code">
                          <DebounceInput
                            element="textarea"
                            minLength={1}
                            debounceTimeout={300}
                            className="im-textarea-code"
                            value={this.props.text}
                            onChange={this.props.onChange}
                          />
                        </div>
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
    textEditorModalIsDisplayed: state.ui.textEditorModalIsDisplayed
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleTextEditorModal
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalTextEditor)
);
