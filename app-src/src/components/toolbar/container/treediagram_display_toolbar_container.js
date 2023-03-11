import { Component } from "react";
import React from "react";
import { TEST_ID } from "common";
import ToolbarButton from "../../toolbar_button";
import ToolbarDropdown from "../../toolbar_dropdown";
import { connect } from "react-redux";
import { getHistoryContext } from "../../../helpers/history/history";
import { withRouter } from "react-router";
import { bindActionCreators } from "redux";
import { toggleDisplayProperty } from "../../../actions/diagram_options";

class PerseidDisplayToolbarContainer extends Component {
  constructor(toolbarOptions) {
    super();
    this.toolbarOptions = toolbarOptions;
  }

  renderDisplayLocallyReferencedButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption={`Display locally referenced`}
        onClick={this.props.toggleDisplayProperty.bind(
          this,
          getHistoryContext(this.props.history, this.props.match),
          "showLocallyReferenced"
        )}
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={this.props.showLocallyReferenced !== false}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.DISPLAY.SHOW_LOCALLY_REFERENCED}
      />
    );
  }

  renderDisplayButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Display"
        icon="im-icon-DisplayMode"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall +
          " im-relative "
        }
        tooltip={"Select display mode"}
        isSelected={false}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.DISPLAY.DROPDOWN}
      />
    );
  }

  renderTreeDiagramDisplayButtons() {
    const isTreeDiagram =
      this.props.activeDiagramObject?.type === "treediagram";
    return (
      isTreeDiagram && (
        <>
          {this.renderDisplaySpecificationsButton()}
          {this.renderDisplayDescriptionsButton()}
        </>
      )
    );
  }

  renderDisplayDescriptionsButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption={`Display specifications`}
        onClick={this.props.toggleDisplayProperty.bind(
          this,
          getHistoryContext(this.props.history, this.props.match),
          "showSpecifications"
        )}
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={this.props.showSpecifications !== false}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.DISPLAY.SHOW_SPECIFICATIONS}
      />
    );
  }

  renderDisplaySpecificationsButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption={`Display descriptions`}
        onClick={this.props.toggleDisplayProperty.bind(
          this,
          getHistoryContext(this.props.history, this.props.match),
          "showDescriptions"
        )}
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={this.props.showDescriptions !== false}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.DISPLAY.SHOW_DESCRIPTIONS}
      />
    );
  }

  render() {
    return (
      <div className="toolbar-container  toolbar-container-display">
        <div className="toolbar-wrapper">
          <ToolbarDropdown
            isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
          >
            {this.renderDisplayButton()}
            <div className="toolbar-dropdown-area drop">
              {this.renderTreeDiagramDisplayButtons()}
              {this.renderDisplayLocallyReferencedButton()}
            </div>
          </ToolbarDropdown>
        </div>
      </div>
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
        toggleDisplayProperty
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(PerseidDisplayToolbarContainer)
);
