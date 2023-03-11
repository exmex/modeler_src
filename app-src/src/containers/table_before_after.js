import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../actions/undoredo";

import ButtonEditLarge from "../components/button_edit_large";
import { DebounceInput } from "react-debounce-input";
import Helpers from "../helpers/helpers";
import ModalTextEditor from "../containers/modals/modal_text_editor";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../helpers/history/history";
import { toggleTextEditorModal } from "../actions/ui";
import { updateTableProperty } from "../actions/tables";
import { v4 as uuidv4 } from "uuid";
import { withRouter } from "react-router-dom";

class TableBeforeAfter extends Component {
  async handleTextChange(propName, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.TABLE_BEFORE_AFTER__UPDATE_TABLE_PROPERTY
    );
    await this.props.updateTableProperty(
      this.props.match.params.id,
      value,
      propName
    );
    await this.props.finishTransaction();
  }

  openInLargeWindow(obj, propertyName, header) {
    this.props.toggleTextEditorModal(
      <ModalTextEditor
        textEditorId={uuidv4()}
        onChange={this.handleTextChange.bind(this, propertyName)}
        modalHeader={_.upperFirst(header)}
        text={Helpers.gv(obj[propertyName])}
      />
    );
  }

  renderBeforeAfter() {
    return (
      <div className="im-properties-grid">
        <div>Before script: </div>
        <div className="im-grid-right-icon">
          <DebounceInput
            element="textarea"
            minLength={1}
            debounceTimeout={300}
            className="im-textarea-code"
            value={Helpers.gv(
              this.props.tables[this.props.match.params.id].beforeScript
            )}
            placeholder={`Hint: Type in the code that should be added before the generated ${_.upperFirst(
              this.props.localization.L_TABLE
            )} script.`}
            onChange={this.handleTextChange.bind(this, "beforeScript")}
          />
          <ButtonEditLarge
            onClick={this.openInLargeWindow.bind(
              this,
              this.props.tables[this.props.match.params.id],
              "beforeScript",
              "Before script"
            )}
          />
        </div>

        <div>After script: </div>
        <div className="im-grid-right-icon">
          <DebounceInput
            element="textarea"
            minLength={1}
            debounceTimeout={300}
            className="im-textarea-code"
            value={Helpers.gv(
              this.props.tables[this.props.match.params.id].afterScript
            )}
            placeholder={`Hint: Type in the code that should be added after the generated ${_.upperFirst(
              this.props.localization.L_TABLE
            )} script.`}
            onChange={this.handleTextChange.bind(this, "afterScript")}
          />
          <ButtonEditLarge
            onClick={this.openInLargeWindow.bind(
              this,
              this.props.tables[this.props.match.params.id],
              "afterScript",
              "After script"
            )}
          />
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="im-full-height-wrapper">{this.renderBeforeAfter()}</div>
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
        startTransaction,
        toggleTextEditorModal
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(TableBeforeAfter)
);
