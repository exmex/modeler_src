import {
  Features,
  isFeatureAvailable
} from "../../../../helpers/features/features";
import React, { Component } from "react";

import AddDocumentButton from "../button/add_document_button";
import AddLineButton from "../button/add_line_button";
import AddNoteButton from "../button/add_note_button";
import AddOtherButton from "../button/add_other_button";
import AddOtherObjectButton from "../button/add_other_object_button";
import AddRelationBelongButton from "../button/add_relation_belongs_button";
import AddRelationButton from "../button/add_relation_button";
import AddTableButton from "../button/add_table_button";
import AddTextNoteButton from "../button/add_text_note_button";
import { ModelTypes } from "common";
import ToolbarDropdown from "../../../toolbar_dropdown";
import _ from "lodash";
import { connect } from "react-redux";

class AddSequelizeButtons extends Component {
  constructor(toolbarOptions) {
    super();
    this.toolbarOptions = toolbarOptions;
  }

  render() {
    const isSequelize = this.props.type === ModelTypes.SEQUELIZE;
    return (
      isSequelize && (
        <>
          <AddTableButton toolbarOptions={this.props.toolbarOptions} />
          <AddRelationButton toolbarOptions={this.props.toolbarOptions} />
          <AddRelationBelongButton toolbarOptions={this.props.toolbarOptions} />
          <AddLineButton toolbarOptions={this.props.toolbarOptions} />
          <AddNoteButton toolbarOptions={this.props.toolbarOptions} />
          <AddTextNoteButton toolbarOptions={this.props.toolbarOptions} />
          <ToolbarDropdown
            isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
          >
            <AddOtherButton toolbarOptions={this.props.toolbarOptions} />
            <div className="toolbar-dropdown-area drop">
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

export default connect(mapStateToProps)(AddSequelizeButtons);
