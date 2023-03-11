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

class ModelDefaultValuesMongoose extends Component {
  async handleTextChange(propName, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.MODEL_DEFAULT_VALUES_MONGOOSE__UPDATE_MODEL_PROPERTY
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
          <div>Schema options:</div>

          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            element="textarea"
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
  connect(mapStateToProps, mapDispatchToProps)(ModelDefaultValuesMongoose)
);
