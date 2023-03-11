import { ModelObjectProperties, ModelTypes } from "../enums/enums";
import React, { Component } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { finishTransaction, startTransaction } from "../actions/undoredo";

import CollapsiblePanel from "../components/collapsible_panel";
import OtherObjectCode from "./other_object_code";
import OtherObjectConstraintsDomainPG from "../platforms/pg/other_object_constraints_domain_pg";
import OtherObjectCustomCode from "./other_object_custom_code";
import OtherObjectGraphQl from "../platforms/graphql/other_object_graphql";
import OtherObjectGraphics from "./other_object_graphics";
import OtherObjectMSSQL from "../platforms/mssql/other_object_mssql";
import OtherObjectMongoose from "../platforms/mongoose/other_object_mongoose";
import OtherObjectPG from "../platforms/pg/other_object_pg";
import OtherObjectProperties from "./other_object_properties";
import OtherObjectSpecificsMSSQL from "../platforms/mssql/other_object_specifics_mssql";
import { OtherObjectTypes } from "common";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getActiveDiagramObject } from "../selectors/selector_diagram";
import { updateOtherObjectProperty } from "../actions/other_objects";
import { withRouter } from "react-router-dom";

class OtherObjectDetail extends Component {
  existsDiagramItemOnActiveDiagram() {
    return (
      this.props.activeDiagramObject &&
      this.props.activeDiagramObject.diagramItems[this.props.match.params.oid]
    );
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
      <div className="im-collapsible-panel">
        <OtherObjectCode />
      </div>
    );
  }

  getCustomCodeByType() {
    const activeType =
      this.props.otherObjects[this.props.match.params.oid].type;
    if (
      this.props.type === "GRAPHQL" &&
      (activeType === "Enum" || activeType === "Scalar")
    ) {
      return (
        <CollapsiblePanel
          panelTitle="Custom code"
          panelKey="pOtherObjectCustomCode"
          panelIsExpanded={this.props.panelsExpanded.pOtherObjectCustomCode}
        >
          <div className="im-collapsible-panel">
            <OtherObjectCustomCode />
          </div>
        </CollapsiblePanel>
      );
    } else if (this.props.type === "PG") {
      if (activeType === "Domain" || activeType === "Enum") {
        return (
          <CollapsiblePanel
            panelTitle="Custom code"
            panelKey="pOtherObjectCustomCode"
            panelIsExpanded={this.props.panelsExpanded.pOtherObjectCustomCode}
          >
            <div className="im-collapsible-panel">
              <OtherObjectCustomCode />
            </div>
          </CollapsiblePanel>
        );
      }
    } else if (this.props.type === ModelTypes.MSSQL) {
      if (activeType === "Sequence" || activeType === "UserDefinedType") {
        return (
          <CollapsiblePanel
            panelTitle="Custom code"
            panelKey="pOtherObjectCustomCode"
            panelIsExpanded={this.props.panelsExpanded.pOtherObjectCustomCode}
          >
            <div className="im-collapsible-panel">
              <OtherObjectCustomCode />
            </div>
          </CollapsiblePanel>
        );
      }
    }
  }

  renderPlatformSpecificProperties() {
    const activeType =
      this.props.otherObjects[this.props.match.params.oid].type;
    return (
      <>
        {this.props.type === "PG" && activeType === "Domain" && (
          <CollapsiblePanel
            panelKey="pDomainConstraints"
            panelTitle="Constraints"
            panelIsExpanded={this.props.panelsExpanded.pDomainConstraints}
          >
            <div className="im-collapsible-panel">
              <OtherObjectConstraintsDomainPG
                domain={this.props.otherObjects[this.props.match.params.oid]}
                updateOtherObjectProperty={this.props.updateOtherObjectProperty}
                finishTransaction={this.props.finishTransaction}
                startTransaction={this.props.startTransaction}
              />
            </div>
          </CollapsiblePanel>
        )}
        {this.props.type === ModelTypes.MSSQL &&
          (activeType === OtherObjectTypes.Domain ||
            activeType === OtherObjectTypes.Function ||
            activeType === OtherObjectTypes.Procedure ||
            activeType === OtherObjectTypes.View ||
            activeType === OtherObjectTypes.Trigger) && (
            <CollapsiblePanel
              panelKey="pOtherObjectSpecifics"
              panelTitle="Specifics"
              panelIsExpanded={this.props.panelsExpanded.pSchema}
            >
              <div className="im-collapsible-panel">
                <div className="im-properties-grid">
                  <OtherObjectSpecificsMSSQL
                    otherObject={
                      this.props.otherObjects[this.props.match.params.oid]
                    }
                    updateOtherObjectProperty={
                      this.props.updateOtherObjectProperty
                    }
                    finishTransaction={this.props.finishTransaction}
                    startTransaction={this.props.startTransaction}
                  />
                </div>
              </div>
            </CollapsiblePanel>
          )}
      </>
    );
  }

  render() {
    if (
      !this.props.match.params.oid ||
      !this.props.otherObjects[this.props.match.params.oid]
    ) {
      return (
        <div className="aside-right-message">
          Select an object to see details.
        </div>
      );
    }

    const activeType =
      this.props.otherObjects[this.props.match.params.oid].type;

    return (
      <Tabs className="im-tabs">
        <div className="im-tabs-grid">
          <div className="im-tabs-tablist">
            <TabList>
              <Tab>Details</Tab>
              {this.props.type !== ModelTypes.LOGICAL ? (
                (this.props.type === "GRAPHQL" &&
                  activeType !== "Enum" &&
                  activeType !== "Scalar") ||
                (this.props.type === "PG" &&
                  activeType !== "Domain" &&
                  activeType !== "Enum") ||
                (this.props.type === ModelTypes.MSSQL &&
                  activeType !== "Sequence" &&
                  activeType !== "UserDefinedType") ? (
                  <Tab>Code</Tab>
                ) : (
                  <Tab>Script</Tab>
                )
              ) : undefined}
            </TabList>
          </div>

          <div className="im-tabs-area">
            <TabPanel className="im-aside">
              <CollapsiblePanel
                panelTitle="Detail"
                panelKey="pOtherObjectDetail"
                panelIsExpanded={this.props.panelsExpanded.pOtherObjectDetail}
              >
                <div className="im-collapsible-panel">
                  <OtherObjectProperties />
                </div>
              </CollapsiblePanel>
              {this.renderPlatformSpecificProperties()}
              {this.existsDiagramItemOnActiveDiagram() ? (
                <CollapsiblePanel
                  panelTitle="Graphics"
                  panelKey="pOtherObjectGraphics"
                  panelIsExpanded={
                    this.props.panelsExpanded.pOtherObjectGraphics
                  }
                >
                  <div className="im-collapsible-panel">
                    <OtherObjectGraphics />
                    <div className="im-content-spacer-md" />
                  </div>
                </CollapsiblePanel>
              ) : undefined}
            </TabPanel>
            {this.props.type !== ModelTypes.LOGICAL ? (
              <TabPanel className="im-aside">
                {this.getTabsByModelType()}
                {this.getCustomCodeByType()}
              </TabPanel>
            ) : undefined}
          </div>
        </div>
      </Tabs>
    );
  }
}

function mapStateToProps(state) {
  return {
    activeDiagramObject: getActiveDiagramObject(state),
    otherObjects: state.otherObjects,
    panelsExpanded: state.ui.panelsExpanded,
    type: state.model.type
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateOtherObjectProperty,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(OtherObjectDetail)
);
