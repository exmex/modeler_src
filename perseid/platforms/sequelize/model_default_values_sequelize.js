import React, { Component } from "react";
import { fetchModel, updateModelProperty } from "../../actions/model";
import { finishTransaction, startTransaction } from "../../actions/undoredo";

import CheckboxSwitch from "../../components/checkbox_switch";
import Helpers from "../../helpers/helpers";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../../helpers/history/history";
import { withRouter } from "react-router-dom";

class ModelDefaultValuesSequelize extends Component {
  async handleCheckboxChange(propName, event) {
    const checked = event.target.checked;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.MODEL_DEFAULT_VALUES_SEQUELIZE__UPDATE_MODEL_PROPERTY
    );
    try {
      await this.props.updateModelProperty(
        this.props.match.params.mid,
        checked,
        propName
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  render() {
    return (
      <div>
        <div className="im-properties-grid">
          <div />
          <CheckboxSwitch
            label="Add new ID column to PK"
            checked={Helpers.gch(this.props.def_coltopk)}
            onChange={this.handleCheckboxChange.bind(this, "def_coltopk")}
          />

          <div />
          <CheckboxSwitch
            label="Timestamps"
            checked={Helpers.gch(this.props.def_timestamps)}
            onChange={this.handleCheckboxChange.bind(this, "def_timestamps")}
          />

          <div />
          <CheckboxSwitch
            label="Paranoid"
            checked={Helpers.gch(this.props.def_paranoid)}
            onChange={this.handleCheckboxChange.bind(this, "def_paranoid")}
          />

          <div />
          <CheckboxSwitch
            label="Freeze Table Name"
            checked={Helpers.gch(this.props.def_freezeTableName)}
            onChange={this.handleCheckboxChange.bind(
              this,
              "def_freezeTableName"
            )}
          />

          <div />
          <CheckboxSwitch
            label="Version"
            checked={Helpers.gch(this.props.def_version)}
            onChange={this.handleCheckboxChange.bind(this, "def_version")}
          />

          <div />
          <CheckboxSwitch
            label="Underscored"
            checked={Helpers.gch(this.props.def_underscored)}
            onChange={this.handleCheckboxChange.bind(this, "def_underscored")}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    def_coltopk: state.model.def_coltopk,
    def_timestamps: state.model.def_timestamps,
    def_paranoid: state.model.def_paranoid,
    def_freezeTableName: state.model.def_freezeTableName,
    def_version: state.model.def_version,
    def_underscored: state.model.def_underscored
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        fetchModel,
        updateModelProperty,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModelDefaultValuesSequelize)
);
