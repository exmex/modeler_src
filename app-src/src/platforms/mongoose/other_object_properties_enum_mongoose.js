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

class OtherObjectPropertiesEnumMongoose extends Component {


  async handleChange(propertyName, e) {
    const value = e.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.OTHER_OBJECT_PROPERTIES_ENUM_MONGOOSE__UPDATE_OTHER_OBJECT_PROPERTY
    );
    try {
      this.props.updateOtherObjectProperty(
        this.props.enum.id,
        value,
        propertyName
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  render() {
    return (
      <>
        <div>Enum values:</div>
        <DebounceInput
          element="textarea"
          minLength={1}
          debounceTimeout={300}
          value={Helpers.gv(this.props.enum.enumValues)}
          onChange={this.handleChange.bind(this, "enumValues")}
          placeholder="Enter values in quotes, separated by commas. Example: 'male', 'female'"
        />
      </>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      { finishTransaction, startTransaction, updateOtherObjectProperty },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(OtherObjectPropertiesEnumMongoose)
);
