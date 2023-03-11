import { DiagramAreaMode, ModelTypes } from "../../../../enums/enums";
import { OtherObjectTypes, TEST_ID } from "common";
import React, { Component } from "react";
import { addImplements, addOtherObject } from "../../../../actions/diagram_add";
import {
  addJsonSchemaGlobalObject,
  onAddClick,
  onAddInputClick,
  onAddInterfaceClick,
  onAddUnionClick
} from "../../../../actions/tables";
import {
  finishTransaction,
  startTransaction
} from "../../../../actions/undoredo";

import AddLineButton from "../button/add_line_button";
import AddNoteButton from "../button/add_note_button";
import AddRelation from "../button/add_relation_button";
import AddTableButton from "../button/add_table_button";
import AddTextNoteButton from "../button/add_text_note_button";
import ToolbarButton from "../../../toolbar_button";
import ToolbarDropdown from "../../../toolbar_dropdown";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { setDiagramAreaMode } from "../../../../actions/ui";
import { withRouter } from "react-router";

class AddButtonsGraphQL extends Component {
  constructor(toolbarOptions) {
    super();
    this.toolbarOptions = toolbarOptions;
  }

  renderAddImplementsButton() {
    return (
      <ToolbarButton
        isSelected={
          this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_IMPLEMENTS
        }
        showCaption={this.props.showToolbarCaptions}
        caption={_.upperFirst(this.props.localization.L_IMPLEMENTS_BUTTON)}
        onClick={this.props.addImplements.bind(this)}
        icon="im-icon-RelationDashed"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={this.props.toolbarOptions.missingModel}
        tooltip={
          "Click on interface, then on target " +
          this.props.localization.L_TABLE
        }
        tooltipClass="im-tooltip-left"
        data-testid={TEST_ID.TOOLBAR.IMPLEMENTS}
      />
    );
  }

  renderAddQueryButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption={OtherObjectTypes.Query}
        onClick={this.props.addOtherObject.bind(this, OtherObjectTypes.Query)}
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={
          this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_QUERY
        }
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.OTHER.QUERY}
      />
    );
  }

  renderAddMutationButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption={OtherObjectTypes.Mutation}
        onClick={this.props.addOtherObject.bind(
          this,
          OtherObjectTypes.Mutation
        )}
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={
          this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_MUTATION
        }
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.OTHER.MUTATION}
      />
    );
  }

  renderAddScalarButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption={OtherObjectTypes.Scalar}
        onClick={this.props.addOtherObject.bind(this, OtherObjectTypes.Scalar)}
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={
          this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_SCALAR
        }
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.OTHER.SCALAR}
      />
    );
  }

  renderAddEnumButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption={OtherObjectTypes.Enum}
        onClick={this.props.addOtherObject.bind(this, OtherObjectTypes.Enum)}
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={
          this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_ENUM
        }
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.OTHER.ENUM}
      />
    );
  }

  renderAddUnionButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption={_.upperFirst(this.props.localization.L_UNION)}
        onClick={this.props.onAddUnionClick.bind(this)}
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        icon="im-icon-Union"
        isSelected={
          this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_UNION
        }
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.UNION}
      />
    );
  }

  renderAddInterfaceButton() {
    return (
      <ToolbarButton
        isSelected={
          this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_INTERFACE
        }
        showCaption={this.props.showToolbarCaptions}
        caption={_.upperFirst(this.props.localization.L_INTERFACE)}
        onClick={this.props.onAddInterfaceClick.bind(this)}
        icon="im-icon-Interface"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={this.props.toolbarOptions.missingModel}
        tooltipClass="im-tooltip-left"
        data-testid={TEST_ID.TOOLBAR.INTERFACE}
      />
    );
  }

  renderAddTypeButton() {
    return (
      <ToolbarButton
        showCaption={this.props.showToolbarCaptions}
        caption={_.upperFirst(this.props.localization.L_INPUT)}
        onClick={this.props.onAddInputClick.bind(this)}
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        icon="im-icon-Type"
        customCss={
          this.props.toolbarOptions.missingModel +
          this.props.toolbarOptions.hideSmall
        }
        isSelected={
          this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_INPUT
        }
        tooltipClass="im-tooltip-right"
        data-testid={TEST_ID.TOOLBAR.INPUT}
      />
    );
  }

  renderAddItemButton() {
    return (
      <ToolbarButton
        data-testid={TEST_ID.TOOLBAR.ADD_FROM_SUBMENU}
        onClick={this.props.setDiagramAreaMode.bind(
          this,
          DiagramAreaMode.ARROW
        )}
        showCaption={this.props.showToolbarCaptions}
        caption="Add item"
        icon="im-icon-Add16"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={this.props.toolbarOptions.missingModel}
        tooltipClass="im-tooltip-right"
        isSelected={
          this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_TABLE ||
          this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_INPUT ||
          this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_INTERFACE ||
          this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_UNION ||
          this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_ENUM ||
          this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_SCALAR ||
          this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_MUTATION ||
          this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_QUERY ||
          this.props.currentDiagramAreaMode === DiagramAreaMode.ADD_OTHER
        }
      />
    );
  }

  render() {
    const isGraphQL = this.props.type === ModelTypes.GRAPHQL;
    return (
      isGraphQL && (
        <>
          <ToolbarDropdown
            isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
          >
            {this.renderAddItemButton()}
            <div className="toolbar-dropdown-area-left drop">
              <AddTableButton toolbarOptions={this.props.toolbarOptions} />
              {this.renderAddTypeButton()}
              {this.renderAddInterfaceButton()}
              {this.renderAddUnionButton()}
              {this.renderAddEnumButton()}
              {this.renderAddScalarButton()}
              {this.renderAddMutationButton()}
              {this.renderAddQueryButton()}
            </div>
          </ToolbarDropdown>
          <AddRelation toolbarOptions={this.props.toolbarOptions} />
          {this.renderAddImplementsButton()}
          <AddLineButton toolbarOptions={this.props.toolbarOptions} />
          <AddNoteButton toolbarOptions={this.props.toolbarOptions} />
          <AddTextNoteButton toolbarOptions={this.props.toolbarOptions} />
        </>
      )
    );
  }
}

function mapStateToProps(state) {
  return {
    showToolbarCaptions: state.settings.showToolbarCaptions,
    currentDiagramAreaMode: state.ui.currentDiagramAreaMode,
    localization: state.localization,
    type: state.model.type
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        addJsonSchemaGlobalObject,
        setDiagramAreaMode,
        startTransaction,
        finishTransaction,
        onAddClick,
        addImplements,
        addOtherObject,
        onAddUnionClick,
        onAddInterfaceClick,
        onAddInputClick
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(AddButtonsGraphQL)
);
