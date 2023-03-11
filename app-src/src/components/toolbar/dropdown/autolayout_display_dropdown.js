import { Component } from "react";
import React from "react";
import { TEST_ID } from "common";
import ToolbarButton from "../../toolbar_button";
import ToolbarDropdown from "../../toolbar_dropdown";
import { autolayout } from "../../../actions/autolayout";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";

class AutolayoutDisplayDropdown extends Component {
  constructor(toolbarOptions) {
    super();
    this.toolbarOptions = toolbarOptions;
  }

  renderLayoutTree() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Tree Layout"
        onClick={this.props.autolayout.bind(
          this,
          "simple-tree",
          this.props.match,
          this.props.history
        )}
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.AUTOLAYOUT.TREE}
      />
    );
  }

  renderLayoutGrid() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Grid Layout"
        onClick={this.props.autolayout.bind(
          this,
          "simple-grid",
          this.props.match,
          this.props.history
        )}
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.AUTOLAYOUT.GRID}
      />
    );
  }

  renderParentChildLayoutButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Parent-Child Layout"
        onClick={this.props.autolayout.bind(
          this,
          "parent-children-grid",
          this.props.match,
          this.props.history
        )}
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.AUTOLAYOUT.PARENT_CHILD}
      />
    );
  }

  renderLayoutButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Layout"
        icon="im-icon-Layout"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall +
          " im-relative "
        }
        tooltip={"Rearrange the diagram"}
        isSelected={false}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.AUTOLAYOUT.DROPDOWN}
      />
    );
  }

  render() {
    return (
      <ToolbarDropdown
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
      >
        {this.renderLayoutButton()}
        <div className="toolbar-dropdown-area drop">
          {this.renderParentChildLayoutButton()}
          {this.renderLayoutGrid()}
          {this.renderLayoutTree()}
        </div>
      </ToolbarDropdown>
    );
  }
}

function mapStateToProps(state) {
  return {
    showToolbarCaptions: state.settings.showToolbarCaptions
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        autolayout
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(AutolayoutDisplayDropdown)
);
