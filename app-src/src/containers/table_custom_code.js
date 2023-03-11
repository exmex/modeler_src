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
import { updateTableProperty } from "../actions/tables";
import { withRouter } from "react-router-dom";

class TableCustomCode extends Component {
  async handleTextChange(propName, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.TABLE_CUSTOM_CODE__UPDATE_TABLE_PROPERTY
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
      UndoRedoDef.TABLE_CUSTOM_CODE__UPDATE_TABLE_PROPERTY
    );
    await this.props.updateTableProperty(
      this.props.match.params.id,
      checked,
      propName
    );
    await this.props.finishTransaction();
  }

  render() {
    if (!this.props.match.params.id || this.props.match.params.id === null) {
      return null;
    }

    if (this.props.tables[this.props.match.params.id] === undefined) {
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
            this.props.tables[this.props.match.params.id].customCode
          )}
          onChange={this.handleTextChange.bind(this, "customCode")}
          placeholder={`Type in your custom code, which can be generated in addition to or instead of the auto-generated script.`}
        />
        <div className="im-code-actions im-code-actions-wide">
          <CheckboxSwitch
            label={this.props.localization.TEXTS.GENERATE}
            checked={Helpers.gch(
              this.props.tables[this.props.match.params.id]
                .generateCustomCode !== false
            )}
            onChange={this.handleCheckboxChange.bind(
              this,
              "generateCustomCode"
            )}
          />
          <ButtonCustom
            type="default"
            size="sm"
            caption={this.props.localization.TEXTS.COPY_TO_CLIPBOARD}
            onClick={() =>
              copyToClipboard(
                Helpers.gv(
                  this.props.tables[this.props.match.params.id].customCode
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
    tables: state.tables,
    localization: state.localization
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
  connect(mapStateToProps, mapDispatchToProps)(TableCustomCode)
);
