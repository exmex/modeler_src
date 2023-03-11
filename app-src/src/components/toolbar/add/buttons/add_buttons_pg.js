import {
  Features,
  isFeatureAvailable
} from "../../../../helpers/features/features";
import React, { Component } from "react";

import AddCompositeButton from "../button/add_composite_button";
import AddDocumentButton from "../button/add_document_button";
import AddDomainButton from "../button/add_domain_button";
import AddEnumButton from "../button/add_enum_button";
import AddFunctionButton from "../button/add_function_button";
import AddLineButton from "../button/add_line_button";
import AddMaterializedViewButton from "../button/add_materialized_view_button";
import AddNoteButton from "../button/add_note_button";
import AddOtherObject from "../button/add_other_button";
import AddOtherObjectButton from "../button/add_other_object_button";
import AddPolicyButton from "../button/add_policy_button";
import AddProcedureButton from "../button/add_procedure_button";
import AddRelationButton from "../button/add_relation_button";
import AddRuleButton from "../button/add_rule_button";
import AddSequenceButton from "../button/add_sequence_button";
import AddTableButton from "../button/add_table_button";
import AddTextNoteButton from "../button/add_text_note_button";
import AddTriggerButton from "../button/add_trigger_button";
import AddViewButton from "../button/add_view_button";
import { ModelTypes } from "common";
import ToolbarDropdown from "../../../toolbar_dropdown";
import _ from "lodash";
import { connect } from "react-redux";

class AddButtonsPG extends Component {
  constructor(toolbarOptions) {
    super();
    this.toolbarOptions = toolbarOptions;
  }

  render() {
    const isPG = this.props.type === ModelTypes.PG;
    return (
      isPG && (
        <>
          <AddTableButton toolbarOptions={this.props.toolbarOptions} />
          <AddCompositeButton toolbarOptions={this.props.toolbarOptions} />
          <AddRelationButton toolbarOptions={this.props.toolbarOptions} />
          <AddLineButton toolbarOptions={this.props.toolbarOptions} />
          <AddNoteButton toolbarOptions={this.props.toolbarOptions} />
          <AddTextNoteButton toolbarOptions={this.props.toolbarOptions} />
          <ToolbarDropdown
            isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
          >
            <AddOtherObject toolbarOptions={this.props.toolbarOptions} />
            <div className="toolbar-dropdown-area drop">
              <AddFunctionButton toolbarOptions={this.props.toolbarOptions} />
              <AddProcedureButton toolbarOptions={this.props.toolbarOptions} />
              <AddRuleButton toolbarOptions={this.props.toolbarOptions} />
              <AddPolicyButton toolbarOptions={this.props.toolbarOptions} />
              <AddSequenceButton toolbarOptions={this.props.toolbarOptions} />
              <AddEnumButton toolbarOptions={this.props.toolbarOptions} />
              <AddDomainButton toolbarOptions={this.props.toolbarOptions} />
              <AddViewButton toolbarOptions={this.props.toolbarOptions} />
              <AddMaterializedViewButton
                toolbarOptions={this.props.toolbarOptions}
              />
              <AddTriggerButton toolbarOptions={this.props.toolbarOptions} />
              <AddOtherObjectButton
                toolbarOptions={this.props.toolbarOptions}
              />
            </div>
          </ToolbarDropdown>
        </>
      )
    );
  }
}
function mapStateToProps(state) {
  return {
    type: state.model.type,
    profile: state.profile
  };
}

export default connect(mapStateToProps)(AddButtonsPG);
