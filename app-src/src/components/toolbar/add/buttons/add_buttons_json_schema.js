import React, { Component } from "react";
import {
  finishTransaction,
  startTransaction
} from "../../../../actions/undoredo";

import { TEST_ID } from "common";
import { TableObjectTypesJson } from "../../../../platforms/jsonschema/class_table_jsonschema";
import ToolbarButton from "../../../toolbar_button";
import { UndoRedoDef } from "../../../../helpers/history/undo_redo_transaction_defs";
import { addJsonSchemaGlobalObject } from "../../../../actions/tables";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../../../../helpers/history/history";
import { withRouter } from "react-router";
import JsonSchemaHelpers from "../../../../platforms/jsonschema/helpers_jsonschema";

class AddJSONSchemaButtons extends Component {
  constructor(toolbarOptions) {
    super();
    this.toolbarOptions = toolbarOptions;
  }

  renderAddSubschemaButton() {
    return (
      <ToolbarButton
        isSelected={false}
        showCaption={this.props.showToolbarCaptions}
        caption={"Subschema"}
        onClick={this.addJsonSchemaGlobalObject.bind(
          this,
          TableObjectTypesJson.OBJECT
        )}
        icon="im-icon-Table"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={this.props.toolbarOptions.missingModel}
        tooltip={"Click to define new subschema "}
        tooltipClass="im-tooltip-left"
        data-testid={TEST_ID.TOOLBAR.OBJECT}
      />
    );
  }

  renderAddExternalRefButton() {
    return (
      <ToolbarButton
        isSelected={false}
        showCaption={this.props.showToolbarCaptions}
        caption={"External ref"}
        onClick={this.addJsonSchemaGlobalObject.bind(
          this,
          TableObjectTypesJson.REF
        )}
        icon="im-icon-Type"
        isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
        customCss={this.props.toolbarOptions.missingModel}
        tooltip={"Click to create a new external ref "}
        tooltipClass="im-tooltip-left"
        data-testid={TEST_ID.TOOLBAR.REF}
      />
    );
  }

  async addJsonSchemaGlobalObject(type) {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.TOOLBAR__ADD_JSON_SCHEMA_GLOBAL_OBJECT
    );
    try {
      await this.props.addJsonSchemaGlobalObject(type);
    } finally {
      await this.props.finishTransaction();
    }
  }

  render() {
    const isJSONSchema = JsonSchemaHelpers.isJSONSchemaModelType(
      this.props.type
    );
    const isOpenAPI = JsonSchemaHelpers.isOpenAPIdModelType(this.props.type);
    return (
      (isJSONSchema || isOpenAPI) && (
        <>
          {this.renderAddSubschemaButton()}
          {this.renderAddExternalRefButton()}
        </>
      )
    );
  }
}

function mapStateToProps(state) {
  return {
    showToolbarCaptions: state.settings.showToolbarCaptions,
    type: state.model.type
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        addJsonSchemaGlobalObject,
        startTransaction,
        finishTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(AddJSONSchemaButtons)
);
