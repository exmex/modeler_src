import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../actions/undoredo";

import { DebounceInput } from "react-debounce-input";
import Helpers from "../helpers/helpers";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../helpers/history/history";
import { updateLineProperty } from "../actions/lines";
import { withRouter } from "react-router-dom";

class LineProperties extends Component {
  async handleTextChange(propName, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.LINE_PROPERTIES__UPDATE_LINE_PROPERTY
    );
    try {
      await this.props.updateLineProperty(
        this.props.match.params.lid,
        value,
        propName
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  getObjectById(id) {
    let toReturn = this.props.tables[id];
    if (toReturn === undefined) toReturn = this.props.notes[id];
    if (toReturn === undefined) toReturn = this.props.otherObjects[id];
    return toReturn;
  }

  getNewName() {
    const parentObject = this.getObjectById(
      this.props.lines[this.props.match.params.lid].parent
    );
    const childObject = this.getObjectById(
      this.props.lines[this.props.match.params.lid].child
    );
    return parentObject.name + "_" + childObject.name;
  }

  async resetLineName() {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.LINE_PROPERTIES__UPDATE_LINE_PROPERTY_NAME
    );
    try {
      this.props.updateLineProperty(
        this.props.match.params.lid,
        this.getNewName(),
        "name"
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  render() {
    if (!this.props.match.params.lid || this.props.match.params.lid === null) {
      return null;
    }

    if (this.props.lines[this.props.match.params.lid] === undefined) {
      return null;
    }

    return (
      <div>
        <div className="im-properties-grid">
          <div>Name:</div>

          <div className="im-field-and-btn">
            <DebounceInput
              type="text"
              debounceTimeout={300}
              value={Helpers.gv(
                this.props.lines[this.props.match.params.lid].name
              )}
              onChange={this.handleTextChange.bind(this, "name")}
            />

            <div
              className="im-has-tooltip im-relative  im-pointer im-icon-sm"
              onClick={this.resetLineName.bind(this)}
            >
              <i className="im-icon-ResetName im-icon-16" />
              <div className={"im-tooltip im-tooltip-right"}>Reset name</div>
            </div>
          </div>

          <div>Description:</div>

          <DebounceInput
            element="textarea"
            minLength={1}
            debounceTimeout={300}
            className="im-textarea"
            value={Helpers.gv(
              this.props.lines[this.props.match.params.lid].desc
            )}
            onChange={this.handleTextChange.bind(this, "desc")}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    tables: state.tables,
    otherObjects: state.otherObjects,
    notes: state.notes,
    lines: state.lines
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateLineProperty,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(LineProperties)
);
