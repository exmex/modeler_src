import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../actions/undoredo";
import {
  setObjectTypeToRootJsonSchema,
  updateTableProperty
} from "../actions/tables";

import ButtonEditLarge from "../components/button_edit_large";
import { DebounceInput } from "react-debounce-input";
import Helpers from "../helpers/helpers";
import JsonSchemaHelpers from "../platforms/jsonschema/helpers_jsonschema";
import ModalTextEditor from "../containers/modals/modal_text_editor";
import { TableObjectTypesJson } from "../platforms/jsonschema/class_table_jsonschema";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../helpers/history/history";
import { toggleTextEditorModal } from "../actions/ui";
import { v4 as uuidv4 } from "uuid";
import { withRouter } from "react-router-dom";

class ColumnTableProperties extends Component {
  async handleTextChange(propName, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.COLUMN_TABLE_PROPERTIES__UPDATE_TABLE_PROPERTY
    );
    try {
      this.props.updateTableProperty(this.props.passedTableId, value, propName);
    } catch (e) {
      console.log(e.message);
    } finally {
      await this.props.finishTransaction();
    }
  }

  async handleChangeObjectType(event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.COLUMN_TABLE_PROPERTIES__CHANGE_TO_JSON_SCHEMA
    );
    try {
      this.props.setObjectTypeToRootJsonSchema(
        this.props.match.params.id,
        value
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  renderDataTypesJsonSchema(colDatatype) {
    return (
      <select
        value={colDatatype}
        onChange={this.handleChangeObjectType.bind(this)}
      >
        {JsonSchemaHelpers.makeDatatypesForRoot(
          colDatatype,
          this.props.tables,
          this.props.catalogColumns,
          this.props.type
        )}
      </select>
    );
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

  render() {
    return (
      <div>
        <div className="im-properties-grid">
          {JsonSchemaHelpers.isPerseidModelType(this.props.type) &&
            this.props.tables[this.props.match.params.id].objectType ===
              "ref" && (
              <>
                <div>Ref URL:</div>
                <div className="im-grid-right-icon">
                  <DebounceInput
                    type="text"
                    debounceTimeout={300}
                    placeholder=""
                    value={Helpers.gv(
                      this.props.tables[this.props.match.params.id].refUrl
                    )}
                    onChange={this.handleTextChange.bind(this, "refUrl")}
                  />
                  <ButtonEditLarge
                    onClick={this.openInLargeWindow.bind(
                      this,
                      this.props.tables[this.props.match.params.id],
                      "refUrl",
                      "Ref URL"
                    )}
                  />
                </div>
              </>
            )}

          <div>Name:</div>
          <div className="im-grid-right-icon">
            <DebounceInput
              type="text"
              debounceTimeout={300}
              value={Helpers.gv(
                this.props.tables[this.props.passedTableId].name
              )}
              onChange={this.handleTextChange.bind(this, "name")}
            />
            <div />
          </div>
          {JsonSchemaHelpers.isPerseidModelType(this.props.type) &&
            JsonSchemaHelpers.isRootOrDef(
              this.props.tables[this.props.match.params.id]
            ) &&
            this.props.tables[this.props.match.params.id].objectType !==
              TableObjectTypesJson.REF && (
              <>
                <div>Type:</div>
                <div className="im-grid-right-icon">
                  {this.renderDataTypesJsonSchema(
                    this.props.tables[this.props.match.params.id].objectType
                  )}
                  <div />
                </div>
              </>
            )}

          <div>Description:</div>
          <div className="im-grid-right-icon">
            <DebounceInput
              element="textarea"
              debounceTimeout={300}
              className="im-textarea"
              value={Helpers.gv(
                this.props.tables[this.props.passedTableId].desc
              )}
              onChange={this.handleTextChange.bind(this, "desc")}
            />
            <ButtonEditLarge
              onClick={this.openInLargeWindow.bind(
                this,
                this.props.tables[this.props.match.params.id],
                "desc",
                "Description"
              )}
            />
          </div>

          {JsonSchemaHelpers.isPerseidModelType(this.props.type) &&
            this.props.tables[this.props.match.params.id].objectType !==
              "ref" && (
              <>
                <div>Specification:</div>
                <div className="im-grid-right-icon">
                  <DebounceInput
                    element="textarea"
                    debounceTimeout={300}
                    className="im-textarea-code"
                    value={Helpers.gv(
                      this.props.tables[this.props.match.params.id]
                        .specification
                    )}
                    onChange={this.handleTextChange.bind(this, "specification")}
                  />
                  <ButtonEditLarge
                    onClick={this.openInLargeWindow.bind(
                      this,
                      this.props.tables[this.props.match.params.id],
                      "specification",
                      "Specification"
                    )}
                  />
                </div>
              </>
            )}

          <div />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    tables: state.tables,
    type: state.model.type,
    catalogColumns: state.catalogColumns
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateTableProperty,
        finishTransaction,
        startTransaction,
        setObjectTypeToRootJsonSchema,
        toggleTextEditorModal
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ColumnTableProperties)
);
