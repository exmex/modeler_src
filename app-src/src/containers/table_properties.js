import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../actions/undoredo";
import {
  setObjectTypeToRootJsonSchema,
  switchEmbeddable,
  updateTableProperty
} from "../actions/tables";

import ButtonEditLarge from "../components/button_edit_large";
import { DebounceInput } from "react-debounce-input";
import Helpers from "../helpers/helpers";
import JsonSchemaHelpers from "../platforms/jsonschema/helpers_jsonschema";
import ModalTextEditor from "../containers/modals/modal_text_editor";
import { ModelTypes } from "../enums/enums";
import OpenAPISchemaAssistantContainer from "../platforms/jsonschema/open_api/open_api_schema_assistant_container";
import { TEST_ID } from "common";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { deleteRelation } from "../actions/relations";
import { getHistoryContext } from "../helpers/history/history";
import { toggleTextEditorModal } from "../actions/ui";
import { v4 as uuidv4 } from "uuid";
import { withRouter } from "react-router-dom";

class TableProperties extends Component {
  async handleTextChange(propName, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.TABLE_PROPERTIES__UPDATE_TABLE_PROPERTY
    );
    await this.props.updateTableProperty(
      this.props.match.params.id,
      value,
      propName
    );
    await this.props.finishTransaction();
  }


  async handleSelectChange(propName, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.TABLE_PROPERTIES__UPDATE_TABLE_PROPERTY
    );
    try {
      await this.props.updateTableProperty(
        this.props.match.params.id,
        value,
        propName
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  async handleChangeObjectType(event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.TABLE_PROPERTIES__SET_OBJECT_TYPE_TO_ROOT_JSON_SCHEMA
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

  renderSchema(type) {
    if (type === ModelTypes.JSONSCHEMA) {
      return this.renderJsonSchema();
    } else if (type === ModelTypes.OPENAPI) {
      return this.renderOpenApiVersion();
    } else return "";
  }

  renderJsonSchema() {
    return (
      <>
        <div>Schema version:</div>

        <div className="im-grid-right-icon">
          <select
            value={Helpers.gv(
              this.props.tables[this.props.match.params.id].schema
            )}
            onChange={this.handleTextChange.bind(this, "schema")}
          >
            {JsonSchemaHelpers.makeSelectSchemas(
              JsonSchemaHelpers.getJsonSchemasArray()
            )}
          </select>
          <div />
        </div>
      </>
    );
  }

  renderOpenApiVersion() {
    return (
      <>
        <div>OpenAPI version:</div>
        <div className="im-grid-right-icon">
          <select
            value={Helpers.gv(
              this.props.tables[this.props.match.params.id].schema
            )}
            onChange={this.handleTextChange.bind(this, "schema")}
          >
            {JsonSchemaHelpers.makeSelectSchemas(
              JsonSchemaHelpers.getOpenApiVersionsArray()
            )}
          </select>
          <div />
        </div>
      </>
    );
  }

  render() {
    return (
      <div>
        {JsonSchemaHelpers.isPerseidModelType(this.props.type) &&
          JsonSchemaHelpers.isSchema(
            this.props.tables[this.props.match.params.id]
          ) && (
            <div className="im-properties-grid">
              {this.renderSchema(this.props.type)}
            </div>
          )}

        {this.props.match.params.id && (
          <div className="im-properties-grid">
            {JsonSchemaHelpers.isPerseidModelType(this.props.type) &&
              JsonSchemaHelpers.isRef(
                this.props.tables[this.props.match.params.id]
              ) && (
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
                  this.props.tables[this.props.match.params.id].name
                )}
                data-testid={TEST_ID.TABLES.NAME}
                onChange={this.handleTextChange.bind(this, "name")}
              />
              <div>&nbsp;</div>
            </div>
            {JsonSchemaHelpers.isJSONSchemaModelType(this.props.type) &&
              !JsonSchemaHelpers.isRef(
                this.props.tables[this.props.match.params.id]
              ) && (
                <>
                  <div>Type:</div>
                  <div className="im-grid-right-icon">
                    {this.renderDataTypesJsonSchema(
                      this.props.tables[this.props.match.params.id].objectType
                    )}
                    <div></div>
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
                  this.props.tables[this.props.match.params.id].desc
                )}
                data-testid={TEST_ID.TABLES.DESCRIPTION}
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
              !JsonSchemaHelpers.isRef(
                this.props.tables[this.props.match.params.id]
              ) && (
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
                      onChange={this.handleTextChange.bind(
                        this,
                        "specification"
                      )}
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

            {!JsonSchemaHelpers.isPerseidModelType(this.props.type) && (
              <>
                <div>Estimated size:</div>
                <div className="im-grid-right-icon">
                  <DebounceInput
                    type="text"
                    debounceTimeout={300}
                    placeholder="Estimated size of data"
                    value={Helpers.gv(
                      this.props.tables[this.props.match.params.id]
                        .estimatedSize
                    )}
                    data-testid={TEST_ID.TABLES.ESTIMATED_SIZE}
                    onChange={this.handleTextChange.bind(this, "estimatedSize")}
                  />
                </div>
              </>
            )}
           
            {JsonSchemaHelpers.isOpenAPIdModelType(this.props.type) && (
              <div className="im-spec-wrapper">
                <OpenAPISchemaAssistantContainer
                  passedTableId={this.props.match.params.id}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    tables: state.tables,
    type: state.model.type,
    localization: state.localization,
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
        switchEmbeddable,
        toggleTextEditorModal
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(TableProperties)
);
