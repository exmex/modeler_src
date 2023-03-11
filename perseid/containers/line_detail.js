import React, { Component } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";

import CollapsiblePanel from "../components/collapsible_panel";
import LineCode from "./line_code";
import LineGraphics from "./line_graphics";
import LineMarkers from "./line_markers";
import LineObjects from "./line_objects";
import LineProperties from "./line_properties";
import { ModelTypes } from "../enums/enums";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { updateLineProperty } from "../actions/lines";
import { withRouter } from "react-router-dom";

class LineDetail extends Component {
  render() {
    if (
      !this.props.match.params.lid ||
      !this.props.lines[this.props.match.params.lid]
    ) {
      return (
        <div className="aside-right-message">
          Select an object to see details.
        </div>
      );
    }

    return (
      <Tabs className="im-tabs">
        <div className="im-tabs-grid">
          <div className="im-tabs-tablist">
            <TabList>
              <Tab>{_.upperFirst(this.props.localization.L_LINE)} Details</Tab>

              {this.props.type !== ModelTypes.LOGICAL ? (
                <Tab>Code</Tab>
              ) : undefined}
            </TabList>
          </div>

          <div className="im-tabs-area">
            <TabPanel className="im-aside">
              <CollapsiblePanel
                panelTitle={
                  _.upperFirst(this.props.localization.L_LINE) + " Detail"
                }
                panelKey="pLineDetail"
                panelIsExpanded={this.props.panelsExpanded.pLineDetail}
              >
                <div className="im-collapsible-panel">
                  <LineProperties />
                  <LineGraphics />
                  <LineMarkers />
                </div>
              </CollapsiblePanel>
              <CollapsiblePanel
                panelTitle="Referenced objects"
                panelKey="pLineReferenced"
                panelIsExpanded={this.props.panelsExpanded.pLineReferenced}
              >
                <div className="im-collapsible-panel">
                  <LineObjects />
                </div>
              </CollapsiblePanel>
            </TabPanel>
            {this.props.type !== ModelTypes.LOGICAL ? (
              <TabPanel className="im-aside">
                <CollapsiblePanel
                  panelTitle="Code"
                  panelKey="pLineCode"
                  panelIsExpanded={this.props.panelsExpanded.pLineCode}
                >
                  <div className="im-collapsible-panel">
                    <LineCode />
                  </div>
                </CollapsiblePanel>
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
    lines: state.lines,
    panelsExpanded: state.ui.panelsExpanded,
    localization: state.localization
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateLineProperty
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(LineDetail)
);
