import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../actions/undoredo";

import { DebounceInput } from "react-debounce-input";
import Helpers from "../helpers/helpers";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../helpers/history/history";
import { updateRelationProperty } from "../actions/relations";
import { withRouter } from "react-router-dom";

class RelationCardinality extends Component {
  async handleTextChange(propName, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.RELATION_CARDINALITY__UPDATE_RELATION_PROPERTY
    );
    try {
      await this.props.updateRelationProperty(
        this.props.match.params.rid,
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
      UndoRedoDef.RELATION_CARDINALITY__UPDATE_RELATION_PROPERTY_BOOLEAN
    );
    try {
      await this.props.updateRelationProperty(
        this.props.match.params.rid,
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
          <div></div>
          <div className="im-rel-key-col-grid">
            <div>Parent</div>
            <div>Child</div>
          </div>

          <div>Cardinality:</div>
          <div className="im-rel-key-col-grid  im-cardinality-grid">
            <select
              value={Helpers.gsel(
                this.props.relations[this.props.match.params.rid].c_p
              )}
              onChange={this.handleTextChange.bind(this, "c_p")}
            >
              <option value="one">One to</option>
              <option value="many">Many to</option>
              <option value="zillion">Zillion to</option>
            </select>
            <select
              value={Helpers.gsel(
                this.props.relations[this.props.match.params.rid].c_ch
              )}
              onChange={this.handleTextChange.bind(this, "c_ch")}
            >
              <option value="one">one</option>
              <option value="many">many</option>
              <option value="zillion">zillion</option>
            </select>
          </div>

          <div>Ordinality:</div>
          <div className="im-rel-key-col-grid  im-cardinality-grid">
            <select
              value={Helpers.gsel(
                this.props.relations[this.props.match.params.rid].c_mp
              )}
              onChange={this.handleTextChange.bind(this, "c_mp")}
            >
              <option value="true">Mandatory</option>
              <option value="false">Optional</option>
            </select>

            <select
              value={Helpers.gsel(
                this.props.relations[this.props.match.params.rid].c_mch
              )}
              onChange={this.handleTextChange.bind(this, "c_mch")}
            >
              <option value="true">Mandatory</option>
              <option value="false">Optional</option>
            </select>
          </div>

          <div>Caption:</div>
          <div className="im-rel-key-col-grid im-cardinality-grid">
            <DebounceInput
              minLength={1}
              debounceTimeout={300}
              type="text"
              value={Helpers.gv(
                this.props.relations[this.props.match.params.rid].c_cp
              )}
              onChange={this.handleTextChange.bind(this, "c_cp")}
            />

            <DebounceInput
              minLength={1}
              debounceTimeout={300}
              type="text"
              value={Helpers.gv(
                this.props.relations[this.props.match.params.rid].c_cch
              )}
              onChange={this.handleTextChange.bind(this, "c_cch")}
            />
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    relations: state.relations
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateRelationProperty,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(RelationCardinality)
);
