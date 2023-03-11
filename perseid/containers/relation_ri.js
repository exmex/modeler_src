import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../actions/undoredo";

import Helpers from "../helpers/helpers";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../helpers/history/history";
import { updateRelationProperty } from "../actions/relations";
import { withRouter } from "react-router-dom";

class RelationRi extends Component {
  async handleSelectChange(propName, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.RELATION_RI__UPDATE_RELATION_PROPERTY
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

  render() {
    return (
      <div>
        <div className="im-properties-grid">
          <div>Parent Delete: </div>

          <select
            value={Helpers.gsel(
              this.props.relations[this.props.match.params.rid].ri_pd
            )}
            onChange={this.handleSelectChange.bind(this, "ri_pd")}
          >
            <option value="na">Not defined</option>
            <option value="Default">Default</option>
            <option value="No action">No action</option>
            <option value="Set default">Set default</option>
            <option value="Set null">Set null</option>
            <option value="Cascade">Cascade</option>
            <option value="Restrict">Restrict</option>
          </select>

          <div>Parent Update: </div>

          <select
            value={Helpers.gsel(
              this.props.relations[this.props.match.params.rid].ri_pu
            )}
            //onChange={this.handleChangeRiPu.bind(this)}
            onChange={this.handleSelectChange.bind(this, "ri_pu")}
          >
            <option value="na">Not defined</option>
            <option value="Default">Default</option>
            <option value="No action">No action</option>
            <option value="Set default">Set default</option>
            <option value="Set null">Set null</option>
            <option value="Cascade">Cascade</option>
            <option value="Restrict">Restrict</option>
          </select>
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
  connect(mapStateToProps, mapDispatchToProps)(RelationRi)
);
