import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../../actions/undoredo";

import CheckboxSwitch from "../../components/checkbox_switch";
import { DebounceInput } from "react-debounce-input";
import Helpers from "../../helpers/helpers";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../../helpers/history/history";
import { updateModelProperty } from "../../actions/model";
import { withRouter } from "react-router-dom";

class ModelDefaultValuesPG extends Component {
  async handleTextChange(propName, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.MODEL_DEFAULT_VALUES_PG__UPDATE_MODEL_PROPERTY
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

  async handleTextChangePlatform(propName, platform, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.MODEL_DEFAULT_VALUES_PG__UPDATE_MODEL_PROPERTY_PLATFORM
    );
    try {
      await this.props.updateModelProperty(
        this.props.match.params.mid,
        { ...this.props.model[platform], [propName]: value },
        platform
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  async handleCheckboxChange(propName, event) {
    const checked = event.target.checked;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.MODEL_DEFAULT_VALUES_PG__UPDATE_MODEL_PROEPRTY_BOOLEAN
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

          <div>Schema: </div>
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(this.props.pg.schema)}
            onChange={this.handleTextChangePlatform.bind(this, "schema", "pg")}
            data-testid="schema"
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    def_coltopk: state.model.def_coltopk,
    pg: state.model.pg,
    model: state.model
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
  connect(mapStateToProps, mapDispatchToProps)(ModelDefaultValuesPG)
);
