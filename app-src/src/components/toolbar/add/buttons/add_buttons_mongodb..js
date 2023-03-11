import React, { Component } from "react";

import AddDocumentButton from "../button/add_document_button";
import AddFunctionButton from "../button/add_function_button";
import AddLineButton from "../button/add_line_button";
import AddNoteButton from "../button/add_note_button";
import AddOtherButton from "../button/add_other_button";
import AddOtherObjectButton from "../button/add_other_object_button";
import AddRelationButton from "../button/add_relation_button";
import AddTableButton from "../button/add_table_button";
import AddTextNoteButton from "../button/add_text_note_button";
import AddViewButton from "../button/add_view_button";
import { ModelTypes } from "common";
import ToolbarDropdown from "../../../toolbar_dropdown";
import _ from "lodash";
import { connect } from "react-redux";

class AddButtonsMongoDB extends Component {
  constructor(toolbarOptions) {
    super();
    this.toolbarOptions = toolbarOptions;
  }

  render() {
    const isMongoDB = this.props.type === ModelTypes.MONGODB;
    return (
      isMongoDB && (
        <>
          <AddTableButton toolbarOptions={this.props.toolbarOptions} />
          
          <AddRelationButton toolbarOptions={this.props.toolbarOptions} />
          <AddLineButton toolbarOptions={this.props.toolbarOptions} />
          <AddNoteButton toolbarOptions={this.props.toolbarOptions} />
          <AddTextNoteButton toolbarOptions={this.props.toolbarOptions} />
          <ToolbarDropdown
            isEnabled={this.props.toolbarOptions.isEnabledToolbarItem}
          >
            <AddOtherButton toolbarOptions={this.props.toolbarOptions} />
            <div className="toolbar-dropdown-area drop">
              <AddFunctionButton toolbarOptions={this.props.toolbarOptions} />
              <AddViewButton toolbarOptions={this.props.toolbarOptions} />
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
    type: state.model.type
  };
}

export default connect(mapStateToProps)(AddButtonsMongoDB);
