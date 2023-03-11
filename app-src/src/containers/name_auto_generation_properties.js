import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../actions/undoredo";

import CheckboxSwitch from "../components/checkbox_switch";
import { ModelTypesForHumans } from "../enums/enums";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../helpers/history/history";
import { updateModelProperty } from "../actions/model";
import { withRouter } from "react-router-dom";

class NameAutoGenerationProperties extends Component {
  async checkChange(pName, event) {
    const checked = event.target.checked;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.MODEL_EXTENDED_PROPERTIES__UPDATE_MODEL_PROPERTY_BOOLEAN
    );
    try {
      await this.props.updateModelProperty(
        this.props.match.params.mid,
        { ...this.props.nameAutoGeneration, [pName]: checked },
        "nameAutoGeneration"
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  render() {
    return (
      <div>
        <div className="im-properties-grid">
          <div style={{ gridRow: "span 6" }}>
            {ModelTypesForHumans.PG} naming and synchronization:
          </div>
          <CheckboxSwitch
            label={"Key names"}
            checked={this.props.nameAutoGeneration.keys}
            onChange={this.checkChange.bind(this, "keys")}
          />
          <div />
          <CheckboxSwitch
            label={"Index names"}
            checked={this.props.nameAutoGeneration.indexes}
            onChange={this.checkChange.bind(this, "indexes")}
          />
          <div />
          <CheckboxSwitch
            label={"Relationship names"}
            checked={this.props.nameAutoGeneration.relations}
            onChange={this.checkChange.bind(this, "relations")}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    nameAutoGeneration: state.model.nameAutoGeneration
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
  connect(mapStateToProps, mapDispatchToProps)(NameAutoGenerationProperties)
);
