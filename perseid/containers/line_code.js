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
import { updateLineProperty } from "../actions/lines";
import { withRouter } from "react-router-dom";

class LineCode extends Component {
  async handleTextChange(propName, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.LINE_CODE__UPDATE_LINE_PROPERTY
    );
    try {
      await this.props.updateLineProperty(
        this.props.match.params.lid,
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
      UndoRedoDef.LINE_CODE__UPDATE_LINE_PROPERTY_BOOLEAN
    );
    try {
      await this.props.updateLineProperty(
        this.props.match.params.lid,
        checked,
        propName
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  render() {
    if (!this.props.match.params.lid || this.props.match.params.lid === null) {
      return null;
    }

    if (this.props.lines[this.props.match.params.lid] === undefined) {
      return null;
    }

    return (
      <div className="im-properties-code">
        <DebounceInput
          element="textarea"
          minLength={1}
          debounceTimeout={300}
          className="im-textarea-code"
          value={Helpers.gv(this.props.lines[this.props.match.params.lid].code)}
          onChange={this.handleTextChange.bind(this, "code")}
        />
        <div className="im-code-actions im-code-actions-wide">
          <CheckboxSwitch
            label={this.props.localization.TEXTS.GENERATE}
            checked={Helpers.gch(
              this.props.lines[this.props.match.params.lid].generate !== false
            )}
            onChange={this.handleCheckboxChange.bind(this, "generate")}
          />
          <ButtonCustom
            type="default"
            size="sm"
            caption={this.props.localization.TEXTS.COPY_TO_CLIPBOARD}
            onClick={() =>
              copyToClipboard(
                Helpers.gv(this.props.lines[this.props.match.params.lid].code)
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
    lines: state.lines,
    localization: state.localization
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateLineProperty,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(LineCode)
);
