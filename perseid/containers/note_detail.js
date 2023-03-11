import React, { Component } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";

import CollapsiblePanel from "../components/collapsible_panel";
import NoteGraphics from "./note_graphics";
import NoteProperties from "./note_properties";
import { connect } from "react-redux";
import { getActiveDiagramObject } from "../selectors/selector_diagram";
import { withRouter } from "react-router-dom";

class NoteDetail extends Component {
  existsDiagramItemOnActiveDiagram() {
    return (
      this.props.activeDiagramObject &&
      this.props.activeDiagramObject.diagramItems[this.props.match.params.nid]
    );
  }

  render() {
    if (
      !this.props.match.params.nid ||
      !this.props.notes[this.props.match.params.nid]
    ) {
      return (
        <div className="aside-right-message">Select a note to see details.</div>
      );
    }

    return (
      <Tabs className="im-tabs">
        <div className="im-tabs-grid">
          <div className="im-tabs-tablist">
            <TabList>
              <Tab>Note Details</Tab>
            </TabList>
          </div>

          <div className="im-tabs-area">
            <TabPanel className="im-aside">
              <CollapsiblePanel
                panelTitle="Note Detail"
                panelKey="pNoteDetail"
                panelIsExpanded={this.props.panelsExpanded.pNoteDetail}
              >
                <div className="im-collapsible-panel">
                  <NoteProperties parentForm="sidePanel" />
                  <div className="im-content-spacer-md" />
                  {this.existsDiagramItemOnActiveDiagram() ? (
                    <NoteGraphics />
                  ) : undefined}
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
    activeDiagramObject: getActiveDiagramObject(state),
    notes: state.notes,
    panelsExpanded: state.ui.panelsExpanded
  };
}

export default withRouter(connect(mapStateToProps)(NoteDetail));
