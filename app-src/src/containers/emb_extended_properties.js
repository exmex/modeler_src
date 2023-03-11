import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../actions/undoredo";

import { DebounceInput } from "react-debounce-input";
import Helpers from "../helpers/helpers";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../helpers/history/history";
import { updateTableProperty } from "../actions/tables";
import { withRouter } from "react-router-dom";

class EmbExtendedProperties extends Component {
  async handleTextChange(propName, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.EMB_EXTENDED_PROPERTIES__UPDATE_TABLE_PROPERTY
    );
    await this.props.updateTableProperty(
      this.props.match.params.id,
      value,
      propName
    );
    await this.props.finishTransaction();
  }

  async handleCheckboxChange(propName, event) {
    const checked = event.target.checked;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.EMB_EXTENDED_PROPERTIES__UPDATE_TABLE_PROPERTY_BOOLEAN
    );
    await this.props.updateTableProperty(
      this.props.match.params.id,
      checked,
      propName
    );
    await this.props.finishTransaction();
  }

  async handleCheckboxChangePlatform(property, platform, event) {
    const checked = event.target.checked;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.EMB_EXTENDED_PROPERTIES__UPDATE_TABLE_PROPERTY_PLATFORM
    );
    await this.props.updateTableProperty(
      this.props.match.params.id,
      {
        ...this.props.tables[this.props.match.params.id][platform],
        [property]: checked
      },
      platform
    );
    await this.props.finishTransaction();
  }

  renderByModelType() {
    if (this.props.type === "MONGODB") {
      return this.renderMongoDb();
    }
  }

  renderMongoDb() {
    return (
      <div className="im-properties-grid">
        <div>Validation:</div>
        <DebounceInput
          element="textarea"
          minLength={1}
          debounceTimeout={300}
          className="im-textarea"
          value={Helpers.gv(
            this.props.tables[this.props.match.params.id].validation
          )}
          onChange={this.handleTextChange.bind(this, "validation")}
        />
      </div>
    );
  }

  render() {
    return <div>{this.renderByModelType()}</div>;
  }
}

function mapStateToProps(state) {
  return {
    tables: state.tables,
    type: state.model.type
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateTableProperty,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(EmbExtendedProperties)
);
