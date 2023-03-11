import React, { Component } from "react";
import {
  autoSize,
  lockDimensions,
  resizeItems
} from "../../../actions/diagram_manipulation";
import { newModel, showConnections, showModels } from "../../../actions/modals";

import { TEST_ID } from "common";
import ToolbarButton from "../../toolbar_button";
import ToolbarDropdown from "../../toolbar_dropdown";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { executeOpenAction } from "../../../actions/model";
import { getHistoryContext } from "../../../helpers/history/history";
import { setReportIsRendered } from "../../../actions/ui";
import { withRouter } from "react-router";

class ResizeDropdown extends Component {
  constructor(toolbarOptions) {
    super();
    this.toolbarOptions = toolbarOptions;
  }

  renderResizeLockDimensions(enabledIconStateCssSubItem) {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Lock dimensions"
        onClick={this.props.lockDimensions.bind(
          this,
          getHistoryContext(this.props.history, this.props.match)
        )}
        icon="im-icon-ShowChildren16"
        isEnabled={
          this.props.toolbarOptions.selectionExists &&
          this.props.toolbarOptions.isEnabledToolbarItem
        }
        customCss={
          this.props.toolbarOptions.missingModel +
          " " +
          enabledIconStateCssSubItem +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={false}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.RESIZE.LOCK_DIMENSIONS}
      />
    );
  }

  renderResizeAutoSize(enabledIconStateCssSubItem) {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Auto size"
        onClick={this.props.autoSize.bind(
          this,
          getHistoryContext(this.props.history, this.props.match)
        )}
        icon="im-icon-ShowChildren16"
        isEnabled={
          this.props.toolbarOptions.selectionExists &&
          this.props.toolbarOptions.isEnabledToolbarItem
        }
        customCss={
          this.props.toolbarOptions.missingModel +
          " " +
          enabledIconStateCssSubItem +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={false}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.RESIZE.AUTOSIZE}
      />
    );
  }

  renderResizeMinHeight() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Min height"
        onClick={this.props.resizeItems.bind(
          this,
          getHistoryContext(this.props.history, this.props.match),
          "height",
          "min"
        )}
        icon="im-icon-SameHeight16"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={false}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.RESIZE.MIN_HEIGHT}
      />
    );
  }

  renderResizeMinWidth() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Min width"
        onClick={this.props.resizeItems.bind(
          this,
          getHistoryContext(this.props.history, this.props.match),
          "width",
          "min"
        )}
        icon="im-icon-SameWidth16"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={false}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.RESIZE.MIN_WIDTH}
      />
    );
  }

  renderResizeMaxHeightButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Max height"
        onClick={this.props.resizeItems.bind(
          this,
          getHistoryContext(this.props.history, this.props.match),
          "height",
          "max"
        )}
        icon="im-icon-SameHeight16"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={false}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.RESIZE.MAX_HEIGHT}
      />
    );
  }

  renderResizeMaxWidthButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Max width"
        onClick={this.props.resizeItems.bind(
          this,
          getHistoryContext(this.props.history, this.props.match),
          "width",
          "max"
        )}
        icon="im-icon-SameWidth16"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={false}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.RESIZE.MAX_WIDTH}
      />
    );
  }

  renderResizeButton(enabledIconStateCssResize) {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Resize"
        icon="im-icon-SameWidth16"
        isEnabled={
          this.props.toolbarOptions.multiSelectionExists &&
          this.props.toolbarOptions.isEnabledToolbarItem
        }
        customCss={
          this.props.toolbarOptions.missingModel +
          " " +
          enabledIconStateCssResize +
          this.props.toolbarOptions.hideSmall +
          " im-relative "
        }
        tooltip={"Set equal size"}
        isSelected={false}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.RESIZE.DROPDOWN}
      />
    );
  }

  render() {
    const enabledIconStateCssResize = !this.props.toolbarOptions
      .multiSelectionExists
      ? " im-disabled"
      : "";
    const enabledIconStateCssSubItem =
      _.size(_.filter(this.props.selections, ["objectType", "table"])) > 0
        ? " "
        : " im-disabled";
    return (
      <ToolbarDropdown
        isEnabled={this.props.toolbarOptions.multiSelectionExists}
      >
        {this.renderResizeButton(enabledIconStateCssResize)}
        <div className="toolbar-dropdown-area drop">
          {this.renderResizeMaxWidthButton()}
          {this.renderResizeMaxHeightButton()}

          {this.renderResizeMinWidth()}

          {this.renderResizeMinHeight()}
          <div className="toolbar-separator-wrapper">
            <div className="toolbar-separator" />
          </div>
          {this.renderResizeAutoSize(enabledIconStateCssSubItem)}
          {this.renderResizeLockDimensions(enabledIconStateCssSubItem)}
        </div>
      </ToolbarDropdown>
    );
  }
}
function mapStateToProps(state) {
  return {
    showToolbarCaptions: state.settings.showToolbarCaptions,
    localization: state.localization,
    selections: state.selections
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        showConnections,
        showModels,
        newModel,
        executeOpenAction,
        setReportIsRendered,
        resizeItems,
        autoSize,
        lockDimensions
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ResizeDropdown)
);
