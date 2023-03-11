import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../../actions/undoredo";

import CheckboxSwitch from "../../components/checkbox_switch";
import { DebounceInput } from "react-debounce-input";
import Helpers from "../../helpers/helpers";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../../helpers/history/history";
import { updateModelProperty } from "../../actions/model";
import { withRouter } from "react-router-dom";

class ModelDefaultValuesMySQLFamily extends Component {
  async handleTextChange(propName, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.MODEL_DEFAULT_VALUES_MYSQLFAMILY__UPDATE_MODEL_PROPERTY
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

  async handleCheckboxChange(propName, event) {
    const checked = event.target.checked;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.MODEL_DEFAULT_VALUES_MYSQLFAMILY__UPDATE_MODEL_PROPERTY_BOOLEAN
    );
    try {
      await this.props.updateModelProperty(
        this.props.match.params.mid,
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
          <div />
          <CheckboxSwitch
            label="Add new ID column to PK"
            checked={Helpers.gch(this.props.def_coltopk)}
            onChange={this.handleCheckboxChange.bind(this, "def_coltopk")}
          />

          <div>Database: </div>
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(this.props.def_database)}
            onChange={this.handleTextChange.bind(this, "def_database")}
          />

          <div>Engine: </div>

          <select
            value={Helpers.gsel(this.props.def_tabletype)}
            onChange={this.handleTextChange.bind(this, "def_tabletype")}
          >
            <option value="na">Not defined</option>
            <option value="Default">Default</option>
            <option value="InnoDB">InnoDB</option>
            <option value="MyISAM">MyISAM</option>
            <option value="MEMORY">Memory</option>
            <option value="CSV">CSV</option>
            <option value="ARCHIVE">Archive</option>
            <option value="EXAMPLE">Example</option>
            <option value="FEDERATED">Federated</option>
            <option value="HEAP">Heap</option>
            <option value="MERGE">Merge</option>
          </select>

          <div>Row format: </div>

          <select
            value={Helpers.gsel(this.props.def_rowformat)}
            onChange={this.handleTextChange.bind(this, "def_rowformat")}
          >
            <option value="na">Not defined</option>
            <option value="Default">Default</option>
            <option value="Compact">Compact</option>
            <option value="Compressed">Compressed</option>
            <option value="Dynamic">Dynamic</option>
            <option value="Fixed">Fixed</option>
            <option value="Redundant">Redundant</option>
          </select>

          <div>Collation: </div>
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(this.props.def_collation)}
            onChange={this.handleTextChange.bind(this, "def_collation")}
          />

          <div>Char set: </div>
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            type="text"
            value={Helpers.gv(this.props.def_charset)}
            onChange={this.handleTextChange.bind(this, "def_charset")}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    def_coltopk: state.model.def_coltopk,
    def_database: state.model.def_database,
    def_tabletype: state.model.def_tabletype,
    def_rowformat: state.model.def_rowformat,
    def_collation: state.model.def_collation,
    def_charset: state.model.def_charset
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
  connect(mapStateToProps, mapDispatchToProps)(ModelDefaultValuesMySQLFamily)
);
