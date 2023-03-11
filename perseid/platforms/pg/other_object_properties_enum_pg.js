import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../../actions/undoredo";

import { DebounceInput } from "react-debounce-input";
import Helpers from "../../helpers/helpers";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../../helpers/history/history";
import { updateOtherObjectProperty } from "../../actions/other_objects";
import { withRouter } from "react-router-dom";

class OtherObjectPropertiesEnumPG extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleChangePg = this.handleChangePg.bind(this);
  }

  async handleChange(e) {
    const value = e.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.OTHER_OBJECT_PROPERTIES_ENUM_PG__UPDATE_OBJECT_OBJECT_PROPERTY_ENUM_VALUES
    );
    try {
      await this.props.updateOtherObjectProperty(
        this.props.enum.id,
        value,
        "enumValues"
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  async handleChangePg(e) {
    const property = e.target.dataset.property;
    const value = e.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.OTHER_OBJECT_PROPERTIES_ENUM_PG__UPDATE_OTHER_OBJECT_PROPERTY
    );
    try {
      await this.props.updateOtherObjectProperty(
        this.props.enum.id,
        { ...this.props.enum.pg, [property]: value },
        "pg"
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  render() {
    return (
      <>
        <div>Schema:</div>
        <DebounceInput
          type="text"
          debounceTimeout={300}
          value={Helpers.gv(
            this.props.enum && this.props.enum.pg && this.props.enum.pg.schema
          )}
          onChange={this.handleChangePg}
          data-property="schema"
        />
        <div>Enum values:</div>
        <DebounceInput
          element="textarea"
          minLength={1}
          debounceTimeout={300}
          value={Helpers.gv(this.props.enum.enumValues)}
          onChange={this.handleChange}
          data-property="values"
        />
      </>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        finishTransaction,
        startTransaction,
        updateOtherObjectProperty
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(null, mapDispatchToProps)(OtherObjectPropertiesEnumPG)
);
