import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../../actions/undoredo";

import { DebounceInput } from "react-debounce-input";
import Helpers from "../../helpers/helpers";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../../helpers/history/history";
import { updateIndexProperty } from "../../actions/tables";
import { withRouter } from "react-router-dom";

class IndexMongoDb extends Component {
  constructor(props) {
    super(props);
    this.getIndexExtendedPropertiesMongoDb =
      this.getIndexExtendedPropertiesMongoDb.bind(this);
  }

  async handleChangePlatform(indexid, property, platform, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.INDEX_MONGODB__UPDATE_INDEX_PROPERTY
    );
    try {
      const index = this.props.tables[this.props.match.params.id].indexes.find(
        (ind) => ind.id === indexid
      );
      const current = index[platform];
      const next = {
        ...current,
        [property]: value
      };
      await this.props.updateIndexProperty(
        this.props.match.params.id,
        indexid,
        next,
        platform
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  getIndexExtendedPropertiesMongoDb(index) {
    return (
      <div className="im-mt">
        <div className="im-properties-grid">
          <div>Fields: </div>
          <DebounceInput
            className="im-textarea-code"
            minLength={1}
            debounceTimeout={300}
            element="textarea"
            value={Helpers.gv(index.mongodb?.fields)}
            onChange={this.handleChangePlatform.bind(
              this,
              index.id,
              "fields",
              "mongodb"
            )}
          />

          <div>Options: </div>
          <DebounceInput
            className="im-textarea-code"
            minLength={1}
            debounceTimeout={300}
            element="textarea"
            value={Helpers.gv(index.mongodb?.options)}
            onChange={this.handleChangePlatform.bind(
              this,
              index.id,
              "options",
              "mongodb"
            )}
          />
        </div>
      </div>
    );
  }

  render() {
    if (this.props.index) {
      let index = this.props.index;
      return this.getIndexExtendedPropertiesMongoDb(index);
    }
  }
}

function mapStateToProps(state) {
  return {
    tables: state.tables
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateIndexProperty,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(IndexMongoDb)
);
