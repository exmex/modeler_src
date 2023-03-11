import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../actions/undoredo";

import ButtonCustom from "../components/button_custom";
import CheckboxSwitch from "../components/checkbox_switch";
import { DebounceInput } from "react-debounce-input";
import Helpers from "../helpers/helpers";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { copyToClipboard } from "../helpers/clipboard";
import { getHistoryContext } from "../helpers/history/history";
import { updateOtherObjectProperty } from "../actions/other_objects";
import { withRouter } from "react-router-dom";

class OtherObjectCode extends Component {
  async handleTextChange(propName, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.OTHER_OBJECT_CODE__UPDATE_OTHER_OBJECT_PROPERTY
    );
    try {
      await this.props.updateOtherObjectProperty(
        this.props.match.params.oid,
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
      UndoRedoDef.OTHER_OBJECT_CODE__UPDATE_OTHER_OBJECT_PROPERTY_BOOLEAN
    );
    try {
      await this.props.updateOtherObjectProperty(
        this.props.match.params.oid,
        checked,
        propName
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  render() {
    if (!this.props.match.params.oid) {
      return null;
    }

    return (
      <div className="im-properties-code">
        <DebounceInput
          element="textarea"
          minLength={1}
          debounceTimeout={300}
          className="im-textarea-code"
          value={Helpers.gv(
            this.props.otherObjects[this.props.match.params.oid].code
          )}
          onChange={this.handleTextChange.bind(this, "code")}
        />
        <div className="im-code-actions im-code-actions-wide">
          <CheckboxSwitch
            label={this.props.localization.TEXTS.GENERATE}
            checked={Helpers.gch(
              this.props.otherObjects[this.props.match.params.oid].generate !==
                false
            )}
            onChange={this.handleCheckboxChange.bind(this, "generate")}
          />
          <ButtonCustom
            type="default"
            size="sm"
            caption={this.props.localization.TEXTS.COPY_TO_CLIPBOARD}
            onClick={() =>
              copyToClipboard(
                Helpers.gv(
                  this.props.otherObjects[this.props.match.params.oid].code
                )
              )
            }
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    otherObjects: state.otherObjects,
    localization: state.localization
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateOtherObjectProperty,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(OtherObjectCode)
);
