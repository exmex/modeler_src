import ToolbarDropdown from "../../toolbar_dropdown";
import ToolbarButton from "../../toolbar_button";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { bindActionCreators } from "redux";
import { alignItems } from "../../../actions/diagram_manipulation";
import { TEST_ID } from "common";
import React, { Component } from "react";
import { getHistoryContext } from "../../../helpers/history/history";

class AlignDropdown extends Component {
  constructor(toolbarOptions) {
    super();
    this.toolbarOptions = toolbarOptions;
  }

  renderAlignVCenterButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Horizontal center"
        onClick={this.props.alignItems.bind(
          this,
          getHistoryContext(this.props.history, this.props.match),
          "vcenter"
        )}
        icon="im-icon-AlignHorizontalCenter16"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={false}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.ALIGN.VCENTER}
      />
    );
  }

  renderAlignHCenterButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Vertical center"
        onClick={this.props.alignItems.bind(
          this,
          getHistoryContext(this.props.history, this.props.match),
          "hcenter"
        )}
        icon="im-icon-AlignVerticalCenter16"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={false}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.ALIGN.HCENTER}
      />
    );
  }

  renderAlignBottomButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Bottom"
        onClick={this.props.alignItems.bind(
          this,
          getHistoryContext(this.props.history, this.props.match),
          "bottom"
        )}
        icon="im-icon-AlignBottom16"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={false}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.ALIGN.BOTTOM}
      />
    );
  }

  renderAlignTopButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Top"
        onClick={this.props.alignItems.bind(
          this,
          getHistoryContext(this.props.history, this.props.match),
          "top"
        )}
        icon="im-icon-AlignTop16"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={false}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.ALIGN.TOP}
      />
    );
  }

  renderAlignRightButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Right"
        onClick={this.props.alignItems.bind(
          this,
          getHistoryContext(this.props.history, this.props.match),
          "right"
        )}
        icon="im-icon-AlignRight16"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={false}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.ALIGN.RIGHT}
      />
    );
  }

  renderAlignLeftButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Left"
        onClick={this.props.alignItems.bind(
          this,
          getHistoryContext(this.props.history, this.props.match),
          "left"
        )}
        icon="im-icon-AlignLeft16"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={false}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.ALIGN.LEFT}
      />
    );
  }

  renderAlignButton(enabledIconStateCssAlign) {
    return (
      <ToolbarButton
        id="toolbar-btn-align-left"
        showCaption={this.props.showToolbarCaptions}
        caption="Align"
        icon="im-icon-AlignLeft"
        isEnabled={
          this.props.toolbarOptions.multiSelectionExists &&
          this.props.toolbarOptions.isEnabledToolbarItem
        }
        customCss={
          this.props.toolbarOptions.missingModel +
          " " +
          enabledIconStateCssAlign +
          this.props.toolbarOptions.hideSmall +
          " im-relative "
        }
        tooltip={"Align items"}
        isSelected={false}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.ALIGN.DROPDOWN}
      />
    );
  }

  render() {
    const enabledIconStateCssAlign = !this.props.toolbarOptions
      .multiSelectionExists
      ? " im-disabled"
      : "";
    return (
      <ToolbarDropdown
        isEnabled={this.props.toolbarOptions.multiSelectionExists}
      >
        {this.renderAlignButton(enabledIconStateCssAlign)}
        <div className="toolbar-dropdown-area drop">
          {this.renderAlignLeftButton()}
          {this.renderAlignRightButton()}
          {this.renderAlignTopButton()}
          {this.renderAlignBottomButton()}
          {this.renderAlignHCenterButton()}
          {this.renderAlignVCenterButton()}
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
        alignItems
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(AlignDropdown)
);
