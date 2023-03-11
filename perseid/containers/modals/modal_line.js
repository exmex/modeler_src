import React, { Component } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";

import { CSSTransition } from "react-transition-group";
import Draggable from "react-draggable";
import JsonSchemaHelpers from "../../platforms/jsonschema/helpers_jsonschema";
import LineCode from "../line_code";
import LineGraphics from "../line_graphics";
import LineMarkers from "../line_markers";
import LineObjects from "../line_objects";
import LineProperties from "../line_properties";
import { ModelTypes } from "../../enums/enums";
import { TEST_ID } from "common";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { toggleLineModal } from "../../actions/ui";
import { updateLineProperty } from "../../actions/lines";
import { withRouter } from "react-router-dom";

class ModalLine extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.escFunction = this.escFunction.bind(this);
  }

  escFunction(event) {
    if (event.keyCode === 27) {
      if (this.props.lineModalIsDisplayed === true) {
        this.props.toggleLineModal();
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
    this.props.toggleLineModal();
  }

  noChange() {
    return null;
  }

  render() {
    const activeLine = this.props.lines[this.props.match.params.lid];
    if (
      this.props.match.params.lid &&
      this.props.lineModalIsDisplayed === true && 
      activeLine
    ) {
      return (
        <CSSTransition
          in={this.props.lineModalIsDisplayed}
          key="modalLine"
          classNames="fade"
          unmountOnExit
          timeout={{ enter: 500, exit: 100 }}
        >
          <Draggable handle=".modal-header">
            <div className="modal" data-testid={TEST_ID.MODALS.LINE}>
              <div className="modal-header">Line details</div>
              <div className="modal-content">
                <Tabs className="im-tabs">
                  <div className="im-tabs-grid">
                    <div className="im-tabs-tablist">
                      <TabList>
                        <Tab>Details</Tab>
                        <Tab>Graphics</Tab>
                        {!JsonSchemaHelpers.isPerseidModelType(
                          this.props.type
                        ) && <Tab>Code</Tab>}
                      </TabList>
                    </div>

                    <div className="im-tabs-area">
                      <TabPanel className="tabDetails im-tab-panel">
                        <LineProperties />
                        <LineObjects />
                      </TabPanel>
                      <TabPanel className="tabDetails im-tab-panel">
                        <LineGraphics />
                        <LineMarkers />
                      </TabPanel>
                      {!JsonSchemaHelpers.isPerseidModelType(
                        this.props.type
                      ) && (
                        <TabPanel className="tabDetails im-tab-panel">
                          <LineCode />
                        </TabPanel>
                      )}
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
    lines: state.lines,
    lineModalIsDisplayed: state.ui.lineModalIsDisplayed
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleLineModal,
        updateLineProperty
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalLine)
);
