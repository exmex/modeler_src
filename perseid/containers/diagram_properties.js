import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../actions/undoredo";

import { DebounceInput } from "react-debounce-input";
import Helpers from "../helpers/helpers";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getActiveDiagramObject } from "../selectors/selector_diagram";
import { getHistoryContext } from "../helpers/history/history";
import { updateDiagramProperty } from "../actions/diagrams";
import { withRouter } from "react-router-dom";

class DiagramProperties extends Component {
  async handleTextChange(propName, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.DIAGRAM_PROPERTIES__UPDATE_DIAGRAM_PROPERTY
    );
    try {
      await this.props.updateDiagramProperty(
        this.props.match.params.did,
        value,
        propName
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  async handleCheckboxChange(propName, event) {
    const checked = event.target.checked;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.DIAGRAM_PROPERTIES__UPDATE_DIAGRAM_PROPERTY_BOOLEAN
    );
    try {
      await this.props.updateDiagramProperty(
        this.props.match.params.did,
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
        {this.props.activeDiagramObject && (
          <div className="im-properties-grid">
            <div className="im-align-self-center">Name:</div>
            <DebounceInput
              key="diagramName"
              minLength={1}
              debounceTimeout={300}
              type="text"
              value={Helpers.gv(this.props.activeDiagramObject.name)}
              onChange={this.handleTextChange.bind(this, "name")}
            />

            <div className="im-align-self-center">Description:</div>
            <DebounceInput
              key="modelDescription"
              minLength={1}
              debounceTimeout={300}
              element="textarea"
              value={Helpers.gv(this.props.activeDiagramObject.description)}
              onChange={this.handleTextChange.bind(this, "description")}
            />
          </div>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    activeDiagramObject: getActiveDiagramObject(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateDiagramProperty,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(DiagramProperties)
);
