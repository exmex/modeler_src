import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../../actions/undoredo";

import { DebounceInput } from "react-debounce-input";
import Helpers from "../../helpers/helpers";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../../helpers/history/history";
import { updateModelProperty } from "../../actions/model";
import { withRouter } from "react-router-dom";

class ModelDefaultValuesMongoDb extends Component {
  async handleTextChange(propName, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.MODEL_DEFAULT_VALUES_MONGODB__UPDATE_MODEL_PROPERTY
    );
    try {
      await this.props.updateModelProperty(
        this.props.match.params.mid,
        value,
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
          <div>Validation level: </div>

          <select
            value={Helpers.gsel(this.props.def_validationLevel)}
            onChange={this.handleTextChange.bind(this, "def_validationLevel")}
          >
            <option value="na">Not defined</option>
            <option value="off">Off</option>
            <option value="strict">Strict</option>
            <option value="moderate">Moderate</option>
          </select>

          <div>Validation action: </div>

          <select
            value={Helpers.gsel(this.props.def_validationAction)}
            onChange={this.handleTextChange.bind(this, "def_validationAction")}
          >
            <option value="na">Not defined</option>
            <option value="error">Error</option>
            <option value="warn">Warn</option>
          </select>

          <div>Collation: </div>
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(this.props.def_collation)}
            onChange={this.handleTextChange.bind(this, "def_collation")}
          />

          <div>Other options: </div>
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            type="textarea"
            value={Helpers.gv(this.props.def_others)}
            onChange={this.handleTextChange.bind(this, "def_others")}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    def_validationLevel: state.model.def_validationLevel,
    def_validationAction: state.model.def_validationAction,
    def_collation: state.model.def_collation,
    def_others: state.model.def_others
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
  connect(mapStateToProps, mapDispatchToProps)(ModelDefaultValuesMongoDb)
);
