import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../actions/undoredo";

import { DebounceInput } from "react-debounce-input";
import Helpers from "../helpers/helpers";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../helpers/history/history";
import { updateModelProperty } from "../actions/model";
import { withRouter } from "react-router-dom";

class ModelAuthor extends Component {
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
          <div>Author name:</div>
          <DebounceInput
            key="authorName"
            minLength={1}
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(this.props.authorName)}
            onChange={this.handleTextChange.bind(this, "authorName")}
          />

          <div>Company:</div>
          <DebounceInput
            key="companyDetails"
            minLength={1}
            debounceTimeout={300}
            element="textarea"
            value={Helpers.gv(this.props.companyDetails)}
            onChange={this.handleTextChange.bind(this, "companyDetails")}
          />

          <div>Website:</div>
          <DebounceInput
            key="companyUrl"
            minLength={1}
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(this.props.companyUrl)}
            onChange={this.handleTextChange.bind(this, "companyUrl")}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    authorName: state.model.authorName,
    companyDetails: state.model.companyDetails,
    companyUrl: state.model.companyUrl
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
  connect(mapStateToProps, mapDispatchToProps)(ModelAuthor)
);
