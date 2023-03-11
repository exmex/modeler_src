import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../actions/undoredo";

import CheckboxSwitch from "../components/checkbox_switch";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../helpers/history/history";
import { updateModelProperty } from "../actions/model";
import { withRouter } from "react-router-dom";

class ModelExtendedProperties extends Component {
  async handleChangeCaseConvention(event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.MODEL_EXTENDED_PROPERTIES__UPDATE_MODEL_PROPERTY
    );
    try {
      await this.props.updateModelProperty(
        this.props.match.params.mid,
        value,
        "caseConvention"
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  async handleParentTableInFkCols(event) {
    const checked = event.target.checked;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.MODEL_EXTENDED_PROPERTIES__UPDATE_MODEL_PROPERTY_BOOLEAN
    );
    try {
      await this.props.updateModelProperty(
        this.props.match.params.mid,
        checked,
        "parentTableInFkCols"
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
            label={
              "Use parent table in FK " + this.props.localization.L_COLUMNS
            }
            checked={this.props.parentTableInFkCols}
            onChange={this.handleParentTableInFkCols.bind(this)}
          />

          <div>Case: </div>

          <select
            value={this.props.caseConvention}
            onChange={this.handleChangeCaseConvention.bind(this)}
          >
            <option value="na">Not defined</option>
            <option value="under">Snake case (example: parent_id)</option>
            <option value="camel">Camel case (example: parentId)</option>
          </select>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    parentTableInFkCols: state.model.parentTableInFkCols,
    caseConvention: state.model.caseConvention,
    localization: state.localization
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
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
  connect(mapStateToProps, mapDispatchToProps)(ModelExtendedProperties)
);
