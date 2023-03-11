import React, { Component } from "react";
import {
  getActiveDiagramAvailableImplements,
  getActiveDiagramAvailableLines,
  getActiveDiagramAvailableNotes,
  getActiveDiagramAvailableOtherObjects,
  getActiveDiagramAvailableRelations,
  getActiveDiagramAvailableTables,
  getActiveDiagramObject
} from "../selectors/selector_diagram";
import {
  processSelection,
  toggleSelection
} from "../components/browser/actions/selection";

import BrowserTree from "../components/browser/browser_tree";
import { bindActionCreators } from "redux";
import { click } from "../components/browser/actions/click";
import { connect } from "react-redux";
import { editObject } from "../components/browser/actions/edit_object";
import { setForcedRender } from "../actions/ui";
import { showObjectContextMenu } from "../components/browser/actions/context_menu";
import { toggleDisclosure } from "../components/browser/actions/disclosure";
import { toggleObjectVisibility } from "../components/browser/actions/visibility";
import { withRouter } from "react-router";

class BrowserTreeContainer extends Component {
  render() {
    return <BrowserTree {...this.props} />;
  }
}

function mapStateToProps(state) {
  return {
    forcedRender: state.ui.forcedRender,
    localization: state.localization,
    selections: state.selections,
    type: state.model.type,
    browserSettings: state.ui.browserSettings,
    browserDisclosure: state.ui.browserDisclosure,
    searchTerm: state.ui.searchTerm,
    showAllObjectsInList: state.settings.showAllObjectsInList,
    modelState: {
      tables: getActiveDiagramAvailableTables(state),
      notes: getActiveDiagramAvailableNotes(state),
      otherObjects: getActiveDiagramAvailableOtherObjects(state),
      implements: getActiveDiagramAvailableImplements(state),
      lines: getActiveDiagramAvailableLines(state),
      relations: getActiveDiagramAvailableRelations(state),
      model: state.model,
      profile: state.profile
    },
    activeDiagramObject: getActiveDiagramObject(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleSelection,
        toggleDisclosure,
        toggleObjectVisibility,
        editObject,
        showObjectContextMenu,
        setForcedRender,
        processSelection,
        click
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(BrowserTreeContainer)
);
