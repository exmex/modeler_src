import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../../actions/undoredo";

import CheckboxSwitch from "../../components/checkbox_switch";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../../helpers/history/history";
import { updateModelProperty } from "../../actions/model";
import { withRouter } from "react-router-dom";

class ModelCodeGenerationSequelize extends Component {
  async handleGenFkSeq(event) {
    const checked = event.target.checked;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.MODEL_CODE_GENERATION_SEQUELIZE__UPDATE_MODEL_PROPERTY
    );
    try {
      await this.props.updateModelProperty(
        this.props.match.params.mid,
        checked,
        "gen_fk_seq"
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
            label="Generate foreign keys"
            checked={this.props.gen_fk_seq}
            onChange={this.handleGenFkSeq.bind(this)}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    gen_fk_seq: state.model.gen_fk_seq
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
  connect(mapStateToProps, mapDispatchToProps)(ModelCodeGenerationSequelize)
);
