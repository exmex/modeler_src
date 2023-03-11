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
import { updateRelationProperty } from "../actions/relations";
import { withRouter } from "react-router-dom";

class RelationCustomCode extends Component {
  async handleTextChange(propName, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.RELATION_CUSTOM_CODE__UPDATE_RELATION_PROPERTY
    );
    try {
      await this.props.updateRelationProperty(
        this.props.match.params.rid,
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
      UndoRedoDef.RELATION_CUSTOM_CODE__UPDATE_RELATION_PROPERTY_BOOLEAN
    );
    try {
      await this.props.updateRelationProperty(
        this.props.match.params.rid,
        checked,
        propName
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  render() {
    if (!this.props.match.params.rid || this.props.match.params.rid === null) {
      return null;
    }

    if (this.props.relations[this.props.match.params.rid] === undefined) {
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
            this.props.relations[this.props.match.params.rid].customCode
          )}
          onChange={this.handleTextChange.bind(this, "customCode")}
          placeholder={`Type in your custom code, which can be generated in addition to or instead of the auto-generated script.`}
        />
        <div className="im-code-actions im-code-actions-wide">
          <CheckboxSwitch
            label={this.props.localization.TEXTS.GENERATE}
            checked={Helpers.gch(
              this.props.relations[this.props.match.params.rid]
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
                  this.props.relations[this.props.match.params.rid].customCode
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
    relations: state.relations,
    localization: state.localization
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateRelationProperty,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(RelationCustomCode)
);
