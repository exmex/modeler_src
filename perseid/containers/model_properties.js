import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../actions/undoredo";

import { DebounceInput } from "react-debounce-input";
import Helpers from "../helpers/helpers";
import { ModelTypesForHumans } from "../enums/enums";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../helpers/history/history";
import { updateModelProperty } from "../actions/model";
import { withRouter } from "react-router-dom";

class ModelProperties extends Component {
  async handleTextChange(propName, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.MODEL__PROPERTIES
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
          <div className="im-align-self-center">Name:</div>
          <DebounceInput
            key="modelName"
            minLength={1}
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(this.props.name)}
            onChange={this.handleTextChange.bind(this, "name")}
          />

          <div className="im-align-self-center">Description:</div>
          <DebounceInput
            key="modelDescription"
            minLength={1}
            debounceTimeout={300}
            element="textarea"
            value={Helpers.gv(this.props.desc)}
            onChange={this.handleTextChange.bind(this, "desc")}
          />

          <div className="im-align-self-center">Type:</div>
          <div>{ModelTypesForHumans[this.props.type]}</div>

          <div className="im-align-self-center">Path:</div>
          <div>{this.props.filePath}</div>

          <div className="im-align-self-center">Last saved:</div>
          <div>{this.props.lastSaved}</div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    name: state.model.name,
    desc: state.model.desc,
    type: state.model.type,
    filePath: state.model.filePath,
    lastSaved: state.model.lastSaved
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
  connect(mapStateToProps, mapDispatchToProps)(ModelProperties)
);
