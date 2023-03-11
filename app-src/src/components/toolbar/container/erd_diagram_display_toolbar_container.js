import { ModelTypes, TEST_ID } from "common";
import {
  changeCardinalityDisplay,
  changeDisplayEmbeddedInParents,
  changeEstimatedSizeDisplay,
  changeSchemaDisplay,
  handleChangeModelLineGraphics
} from "../../../actions/diagram_options";

import AutolayoutDisplayDropDown from "../dropdown/autolayout_display_dropdown";
import { Component } from "react";
import JsonSchemaHelpers from "../../../platforms/jsonschema/helpers_jsonschema";
import React from "react";
import ToolbarButton from "../../toolbar_button";
import ToolbarDropdown from "../../toolbar_dropdown";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getActiveDiagramObject } from "../../../selectors/selector_diagram";
import { getHistoryContext } from "../../../helpers/history/history";
import { setDisplayMode } from "../../../actions/model";
import { withRouter } from "react-router";

class ERDDiagramDisplayToolbarContainer extends Component {
  constructor(toolbarOptions) {
    super();
    this.toolbarOptions = toolbarOptions;
  }

  renderLineModeButton() {
    const isLineSelected =
      this.props.activeDiagramObject?.linegraphics === "basic";
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Line mode"
        onClick={this.props.handleChangeModelLineGraphics.bind(
          this,
          getHistoryContext(this.props.history, this.props.match),
          this.props.activeDiagramObject
        )}
        icon="im-icon-LineMode"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={this.props.toolbarOptions.missingModel}
        tooltip={"Change line mode"}
        isSelected={isLineSelected}
        tooltipClass="im-tooltip-left"
        data-testid={TEST_ID.TOOLBAR.LINE_MODE}
      />
    );
  }

  renderERDDisplayModes() {
    const notPerseid = !JsonSchemaHelpers.isPerseidModelType(this.props.type);
    const hasIndex =
      this.props.type !== ModelTypes.LOGICAL &&
      this.props.type !== ModelTypes.GRAPHQL &&
      this.props.type !== ModelTypes.MONGOOSE;
    const hasNestedObjects =
      this.props.type === ModelTypes.MONGODB ||
      this.props.type === ModelTypes.MONGOOSE;
    const hasContainer =
      this.props.type === ModelTypes.PG ||
      this.props.type === ModelTypes.MARIADB ||
      this.props.type === ModelTypes.MYSQL ||
      this.props.type === ModelTypes.MSSQL;
    return (
      <ToolbarDropdown
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
      >
        {this.renderDisplayButton()}
        <div className="toolbar-dropdown-area drop">
          {this.renderDisplayMetadataButton()}
          {notPerseid && this.renderSampleDataButton()}
          {this.renderDescriptionButton()}
          {notPerseid && hasIndex && this.renderIndexesButton()}

          <div className="toolbar-separator-wrapper">
            <div className="toolbar-separator" />
          </div>

          {hasNestedObjects && this.renderNestedObjectsButton()}
          {hasContainer && this.renderDisplaySchemaButton()}
          {notPerseid && this.renderChangeCardinalityButton()}
          {notPerseid && this.renderChangeEstimatedSizesButton()}
        </div>
      </ToolbarDropdown>
    );
  }

  renderDisplayMetadataButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Metadata"
        onClick={this.props.setDisplayMode.bind(this, "metadata")}
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={this.props.currentDisplayMode === "metadata"}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.DISPLAY.METADATA}
      />
    );
  }

  renderChangeEstimatedSizesButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption={`Display estimated sizes`}
        onClick={this.props.changeEstimatedSizeDisplay.bind(
          this,
          getHistoryContext(this.props.history, this.props.match)
        )}
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={this.props.estimatedSizeIsDisplayed === true}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.DISPLAY.ESTIMATED_SIZES}
      />
    );
  }

  renderChangeCardinalityButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption={`Display cardinality captions`}
        onClick={this.props.changeCardinalityDisplay.bind(
          this,
          getHistoryContext(this.props.history, this.props.match)
        )}
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={this.props.cardinalityIsDisplayed === true}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.DISPLAY.CARDINALITY_CAPTIONS}
      />
    );
  }

  renderDisplaySchemaButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption={`Display ${
          this.props.type === ModelTypes.PG ||
          this.props.type === ModelTypes.MSSQL
            ? "schema"
            : "database"
        }`}
        onClick={this.props.changeSchemaDisplay.bind(
          this,
          getHistoryContext(this.props.history, this.props.match)
        )}
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={this.props.schemaContainerIsDisplayed !== false}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.DISPLAY.SCHEMA}
      />
    );
  }

  renderNestedObjectsButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption={`Display object details`}
        onClick={this.props.changeDisplayEmbeddedInParents.bind(
          this,
          getHistoryContext(this.props.history, this.props.match)
        )}
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={this.props.embeddedInParentsIsDisplayed !== false}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.DISPLAY.NESTED_OBJECTS}
      />
    );
  }

  renderIndexesButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Indexes"
        onClick={this.props.setDisplayMode.bind(this, "indexes")}
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={this.props.currentDisplayMode === "indexes"}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.DISPLAY.INDEXES}
      />
    );
  }

  renderDescriptionButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Description"
        onClick={this.props.setDisplayMode.bind(this, "description")}
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={this.props.currentDisplayMode === "description"}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.DISPLAY.DESCRIPTION}
      />
    );
  }

  renderSampleDataButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption="Sample data"
        onClick={this.props.setDisplayMode.bind(this, "data")}
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={this.props.currentDisplayMode === "data"}
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.DISPLAY.DATA}
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

  render() {
    const isPerseid = JsonSchemaHelpers.isPerseidModelType(this.props.type);
    return (
      <div className="toolbar-container  toolbar-container-display">
        <div className="toolbar-wrapper">
          <AutolayoutDisplayDropDown
            toolbarOptions={this.props.toolbarOptions}
          />
          {!isPerseid && this.renderLineModeButton()}
          {!isPerseid && this.renderERDDisplayModes()}
        </div>
        <div className="toolbar-item-divider" />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    showToolbarCaptions: state.settings.showToolbarCaptions,
    activeDiagramObject: getActiveDiagramObject(state),
    currentDisplayMode: state.model.currentDisplayMode,
    embeddedInParentsIsDisplayed: state.model.embeddedInParentsIsDisplayed,
    cardinalityIsDisplayed: state.model.cardinalityIsDisplayed,
    estimatedSizeIsDisplayed: state.model.estimatedSizeIsDisplayed,
    profile: state.profile,
    type: state.model.type,
    schemaContainerIsDisplayed: state.model.schemaContainerIsDisplayed
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        handleChangeModelLineGraphics,
        setDisplayMode,
        changeEstimatedSizeDisplay,
        changeCardinalityDisplay,
        changeSchemaDisplay,
        changeDisplayEmbeddedInParents
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ERDDiagramDisplayToolbarContainer)
);
