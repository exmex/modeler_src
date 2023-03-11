import React, { Component } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";

import CollapsiblePanel from "../components/collapsible_panel";
import DiagramGraphics from "./diagram_graphics";
import DiagramProperties from "./diagram_properties";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

class DiagramDetail extends Component {
  render() {
    if (
      !this.props.match.params.did ||
      !this.props.diagrams[this.props.match.params.did]
    ) {
      return (
        <div className="aside-right-message">
          Select a sub diagram to see details.
        </div>
      );
    }
    return (
      <Tabs className="im-tabs">
        <div className="im-tabs-grid">
          <div className="im-tabs-tablist">
            <TabList>
              <Tab>Diagram Details</Tab>
            </TabList>
          </div>

          <div className="im-tabs-area">
            <TabPanel className="im-aside">
              <CollapsiblePanel
                panelTitle={this.props.localization.L_DIAGRAM}
                panelKey="pDiagram"
                panelIsExpanded={this.props.panelsExpanded.pDiagram}
              >
                <div className="im-collapsible-panel">
                  <DiagramProperties />
                  <DiagramGraphics />
                </div>
              </CollapsiblePanel>
            </TabPanel>
          </div>
        </div>
      </Tabs>
    );
  }
}

function mapStateToProps(state) {
  return {
    panelsExpanded: state.ui.panelsExpanded,
    diagrams: state.diagrams,
    localization: state.localization
  };
}

export default withRouter(connect(mapStateToProps)(DiagramDetail));
