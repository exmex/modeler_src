import { OtherObjectTypes, TEST_ID } from "common";
import React, { Component } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";

import { CSSTransition } from "react-transition-group";
import Draggable from "react-draggable";
import { ModelTypes } from "../../enums/enums";
import OtherObjectCode from "../other_object_code";
import OtherObjectCustomCode from "../other_object_custom_code";
import OtherObjectGraphQl from "../../platforms/graphql/other_object_graphql";
import OtherObjectGraphics from "../other_object_graphics";
import OtherObjectMSSQL from "../../platforms/mssql/other_object_mssql";
import OtherObjectMongoose from "../../platforms/mongoose/other_object_mongoose";
import OtherObjectPG from "../../platforms/pg/other_object_pg";
import OtherObjectProperties from "../other_object_properties";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { toggleOtherObjectModal } from "../../actions/ui";
import { withRouter } from "react-router-dom";

class ModalOtherObject extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.escFunction = this.escFunction.bind(this);
  }

  escFunction(event) {
    if (event.keyCode === 27) {
      if (this.props.otherObjectModalIsDisplayed === true) {
        this.props.toggleOtherObjectModal();
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
    this.props.toggleOtherObjectModal();
  }

  noChange() {
    return null;
  }

  getTabsByModelType() {
    const activeType =
      this.props.otherObjects[this.props.match.params.oid].type;
    if (
      this.props.type === "GRAPHQL" &&
      (activeType === "Enum" || activeType === "Scalar")
    ) {
      return <OtherObjectGraphQl />;
    } else if (this.props.type === "PG") {
      if (activeType === "Domain" || activeType === "Enum") {
        return <OtherObjectPG />;
      }
    } else if (this.props.type === ModelTypes.MSSQL) {
      if (
        activeType === OtherObjectTypes.Sequence ||
        activeType === OtherObjectTypes.UserDefinedType
      ) {
        return <OtherObjectMSSQL />;
      }
    } else if (this.props.type === "MONGOOSE") {
      if (activeType === "Enum") {
        return <OtherObjectMongoose />;
      }
    }
    return (
      <div className="im-full-height-wrapper">
        <OtherObjectCode />
      </div>
    );
  }

  isCustomCode() {
    const activeType =
      this.props.otherObjects[this.props.match.params.oid].type;
    return (
      (this.props.type === "PG" &&
        (activeType === "Domain" || activeType === "Enum")) ||
      (this.props.type === ModelTypes.MSSQL &&
        (activeType === OtherObjectTypes.Sequence ||
          activeType === OtherObjectTypes.UserDefinedType))
    );
  }

  render() {
    if (
      this.props.match.params.oid &&
      this.props.otherObjects[this.props.match.params.oid] &&
      this.props.otherObjectModalIsDisplayed === true
    ) {
      return (
        <CSSTransition
          in={this.props.otherObjectModalIsDisplayed}
          key="modalOtherObject"
          classNames="fade"
          unmountOnExit
          timeout={{ enter: 500, exit: 100 }}
        >
          <Draggable handle=".modal-header">
            <div className="modal" data-testid={TEST_ID.MODALS.OTHER_OBJECT}>
              <div className="modal-header">Details</div>
              <div className="modal-content">
                <Tabs className="im-tabs">
                  <div className="im-tabs-grid">
                    <div className="im-tabs-tablist">
                      <TabList>
                        <Tab>Details</Tab>
                        {this.props.type !== ModelTypes.LOGICAL ? (
                          (this.props.type === "GRAPHQL" &&
                            this.props.otherObjects[this.props.match.params.oid]
                              .type !== "Enum" &&
                            this.props.otherObjects[this.props.match.params.oid]
                              .type !== "Scalar") ||
                          (this.props.type !== ModelTypes.MSSQL &&
                            (this.props.otherObjects[
                              this.props.match.params.oid
                            ].type === OtherObjectTypes.Sequence ||
                              this.props.otherObjects[
                                this.props.match.params.oid
                              ].type === OtherObjectTypes.UserDefinedType)) ? (
                            <Tab>Code</Tab>
                          ) : (
                            <Tab>Script</Tab>
                          )
                        ) : undefined}
                        <Tab>Graphics</Tab>
                        {this.props.type !== ModelTypes.LOGICAL &&
                        this.isCustomCode() ? (
                          <Tab>Custom Code</Tab>
                        ) : (
                          <></>
                        )}
                      </TabList>
                    </div>

                    <div className="im-tabs-area">
                      <TabPanel className="tabDetails im-tab-panel">
                        <OtherObjectProperties />
                      </TabPanel>
                      {this.props.type !== ModelTypes.LOGICAL ? (
                        <TabPanel className="tabDetails im-tab-panel">
                          {this.getTabsByModelType()}
                        </TabPanel>
                      ) : undefined}
                      <TabPanel className="tabRI im-tab-panel">
                        <OtherObjectGraphics />
                      </TabPanel>

                      {this.props.type !== ModelTypes.LOGICAL &&
                      this.isCustomCode() ? (
                        <TabPanel>
                          <OtherObjectCustomCode />
                        </TabPanel>
                      ) : (
                        <></>
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
    otherObjects: state.otherObjects,
    otherObjectModalIsDisplayed: state.ui.otherObjectModalIsDisplayed,
    type: state.model.type
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleOtherObjectModal
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalOtherObject)
);
