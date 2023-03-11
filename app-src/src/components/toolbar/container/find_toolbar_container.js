import { Component } from "react";
import React from "react";
import { TEST_ID } from "common";
import ToolbarButton from "../../toolbar_button";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { toggleFinder } from "../../../actions/ui";
import { withRouter } from "react-router";
import { getActiveDiagramObject } from "../../../selectors/selector_diagram";

class FindToolbarContainer extends Component {
  constructor(toolbarOptions) {
    super();
    this.toolbarOptions = toolbarOptions;
  }

  renderFindButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Find"
        onClick={this.props.toggleFinder.bind(this)}
        icon="im-icon-Search16"
        isEnabled={true}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.availableInTreeDiagram
        }
        tooltip={"Find on diagram (CTRL+F)"}
        isSelected={this.props.finderIsDisplayed}
        tooltipClass="im-tooltip-left"
        data-testid={TEST_ID.TOOLBAR.FINDER}
      />
    );
  }

  render() {
    const isTreeDiagram =
      this.props.activeDiagramObject?.type === "treediagram";

    return (
      isTreeDiagram && (
        <div className="toolbar-container toolbar-container-find">
          <div className="toolbar-wrapper">{this.renderFindButton()}</div>
        </div>
      )
    );
  }
}

function mapStateToProps(state) {
  return {
    showToolbarCaptions: state.settings.showToolbarCaptions,
    finderIsDisplayed: state.ui.finderIsDisplayed,
    activeDiagramObject: getActiveDiagramObject(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleFinder
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(FindToolbarContainer)
);
