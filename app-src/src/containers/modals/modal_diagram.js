import React, { Component } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";

import { CSSTransition } from "react-transition-group";
import DiagramGraphics from "../diagram_graphics";
import DiagramProperties from "../diagram_properties";
import Draggable from "react-draggable";
import { TEST_ID } from "common";
import UIHelpers from "../../helpers/ui_helpers";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { toggleDiagramModal } from "../../actions/ui";
import { withRouter } from "react-router-dom";

class ModalDiagram extends Component {
  constructor(props) {
    super(props);
    this.escFunction = this.escFunction.bind(this);
  }

  escFunction(event) {
    if (event.keyCode === 27) {
      if (this.props.modelDiagramIsDisplayed === true) {
        this.props.toggleDiagramModal();
      }
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }

  onShowDiagramClick() {
    this.props.toggleDiagramModal();
    UIHelpers.setFocusToCanvasAndKeepScrollPosition();
  }

  render() {
    if (this.props.diagramModalIsDisplayed === true) {
      return (
        <CSSTransition
          in={this.props.diagramModalIsDisplayed}
          key="ModalModel"
          classNames="fade"
          unmountOnExit
          timeout={{ enter: 500, exit: 100 }}
        >
          <div className="modal-wrapper">
            <Draggable handle=".modal-header">
              <div className="modal modal" data-testid={TEST_ID.MODALS.DIAGRAM}>
                <div className="modal-header">Diagram</div>
                <div className="modal-content">
                  <Tabs className="im-tabs">
                    <div className="im-tabs-grid">
                      <div className="im-tabs-tablist">
                        <TabList>
                          <Tab>Diagram Details</Tab>
                        </TabList>
                      </div>

                      <div className="im-tabs-area">
                        <TabPanel className="tabDetails im-tab-panel">
                          <DiagramProperties />
                          <DiagramGraphics />
                        </TabPanel>
                      </div>
                    </div>
                  </Tabs>
                </div>

                <div className="modal-footer">
                  <button
                    autoFocus
                    className="im-btn-default im-margin-right"
                    onClick={this.onShowDiagramClick.bind(this)}
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
    diagramModalIsDisplayed: state.ui.diagramModalIsDisplayed
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleDiagramModal
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalDiagram)
);
