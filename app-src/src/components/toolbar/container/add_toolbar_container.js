import AddButtonsGraphQL from "../add/buttons/add_buttons_graphql";
import AddButtonsJSONSchema from "../add/buttons/add_buttons_json_schema";
import AddButtonsLogical from "../add/buttons/add_buttons_logical";
import AddButtonsMSSQL from "../add/buttons/add_buttons_mssql";
import AddButtonsMongoDB from "../add/buttons/add_buttons_mongodb.";
import AddButtonsMongoose from "../add/buttons/add_buttons_mongoose";
import AddButtonsMySQLFamily from "../add/buttons/add_buttons_mysql_family";
import AddButtonsPG from "../add/buttons/add_buttons_pg";
import AddButtonsSQLite from "../add/buttons/add_buttons_sqlite";
import AddButtonsSequelize from "../add/buttons/add_buttons_sequelize";
import { Component } from "react";
import React from "react";
import SelectButton from "../add/button/select_button";
import _ from "lodash";

class AddToolbarContainer extends Component {
  constructor(toolbarOptions) {
    super();
    this.toolbarOptions = toolbarOptions;
  }

  render() {
    return (
      <div className="toolbar-container toolbar-container-objects">
        <div className="toolbar-wrapper">
          <SelectButton toolbarOptions={this.props.toolbarOptions} />

          <AddButtonsGraphQL toolbarOptions={this.props.toolbarOptions} />
          <AddButtonsJSONSchema toolbarOptions={this.props.toolbarOptions} />
          <AddButtonsPG toolbarOptions={this.props.toolbarOptions} />
          <AddButtonsMSSQL toolbarOptions={this.props.toolbarOptions} />
          <AddButtonsMySQLFamily toolbarOptions={this.props.toolbarOptions} />
          <AddButtonsSQLite toolbarOptions={this.props.toolbarOptions} />
          <AddButtonsMongoDB toolbarOptions={this.props.toolbarOptions} />
          <AddButtonsMongoose toolbarOptions={this.props.toolbarOptions} />
          <AddButtonsLogical toolbarOptions={this.props.toolbarOptions} />
          <AddButtonsSequelize toolbarOptions={this.props.toolbarOptions} />
        </div>
        <div className="toolbar-item-divider" />
      </div>
    );
  }
}

export default AddToolbarContainer;
